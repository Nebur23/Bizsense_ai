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




export async function setupDefaultTaxTypes(businessId: string) {
  const defaultTaxes = [
    { taxName: "VAT", taxCode: "VAT", taxRate: 19.25 },
    { taxName: "Withholding Tax", taxCode: "WHT", taxRate: 5.5 },
    // Add other Cameroon-specific defaults
  ];

  return await prisma.$transaction(
    defaultTaxes.map(tax =>
      prisma.taxType.create({
        data: {
          businessId,
          ...tax,
          isActive: true,
        },
      })
    )
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
