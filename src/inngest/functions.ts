import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client";
import prisma from "@/lib/prisma";
import EmailTemplate from "../../emails/template";
import { sendEmail } from "@/actions/send-email";



export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await prisma.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const rawStats = await getMonthlyStats(user.id, lastMonth);
        const stats = {
          totalIncome: rawStats.totalIncome,
          totalExpenses: rawStats.totalExpenses,
          byCategory: {
            housing: rawStats.byCategory['housing'] || 0,
            groceries: rawStats.byCategory['groceries'] || 0,
            transportation: rawStats.byCategory['transportation'] || 0,
            entertainment: rawStats.byCategory['entertainment'] || 0,
            utilities: rawStats.byCategory['utilities'] || 0,
          }
        };
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name as string,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

async function generateFinancialInsights(
  stats: {
    totalIncome: number;
    totalExpenses: number;
    byCategory: { [s: string]: unknown } | ArrayLike<unknown>;
  },
  month: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

async function getMonthlyStats(userId: string, month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      id: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
  (stats, t) => {
    const amount = t.amount;
    if (t.type === "EXPENSE" && t.categoryId) {
      stats.totalExpenses += amount;
      stats.byCategory[t.categoryId] =
        (stats.byCategory[t.categoryId] || 0) + amount;
    } else {
      stats.totalIncome += amount;
    }
    return stats;
  },
  {
    totalExpenses: 0,
    totalIncome: 0,
    byCategory: {} as Record<string, number>,
    transactionCount: transactions.length,
  }
  );
}
