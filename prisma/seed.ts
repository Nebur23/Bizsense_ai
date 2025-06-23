import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 3. Create Account Types
  const accountTypes = ["Asset", "Liability", "Equity", "Income", "Expense"];
  for (const name of accountTypes) {
    await prisma.accountType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Created account types");
}



main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
