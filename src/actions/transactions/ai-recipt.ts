/* eslint-disable @typescript-eslint/no-explicit-any */

import { GoogleGenerativeAI } from "@google/generative-ai";

// if (!process.env.GEMINI_API_KEY)
//   throw new Error("GEMINI_API_KEY is not defined");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// Scan Receipt
export async function scanReceipt(file: { arrayBuffer: () => any; type: any }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: Sale, Purchase, Expense, Refund, Transfer,
      Loan Disbursement, Loan Repayment, Subscription Payment, Salary payment,
      Grant Receipt, Utility Payment, Maintenance Expense, Reimbursement,
      Insurance Payment, Penalty or Fine, Depreciation)
      - Transaction type (one of: SALE, PURCHASE, EXPENSE, REFUND, TRANSFER,
      LOAN_DISBURSEMENT, LOAN_REPAYMENT, SUBSCRIPTION_PAYMENT, INVESTMENT_INFLOW,
      INVESTMENT_OUTFLOW, TAX_PAYMENT, SALARY_PAYMENT, COMMISSION, DONATION,
      GRANT_RECEIPT, UTILITY_PAYMENT, MAINTENANCE_EXPENSE, INSURANCE_PAYMENT,
      REIMBURSEMENT, PENALTY_OR_FINE, DEPRECIATION)
     
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
        "transactionType": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
        transactionType: data.transactionType,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}
