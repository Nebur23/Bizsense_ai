import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log(
    "Seeding Product Categories, Products, Customers, and Contacts..."
  );
  // First create a business (required for relations)
  const business = await prisma.business.findFirst();

  if (!business) {
    throw new Error("Business not found. Please create a business first.");
  }

  console.log(`Created business with ID: ${business.id} - ${business.name}`);

  // Seed Product Categories (with hierarchy)
  const parentCategory = await prisma.productCategory.create({
    data: {
      categoryName: "Parent Category",
      description: "Top level category",
      businessId: business.id,
    },
  });

  const categories = await prisma.productCategory.createMany({
    data: [
      {
        categoryName: "Electronics",
        description: "Devices and gadgets",
        businessId: business.id,
        parentCategoryId: parentCategory.id,
      },
      {
        categoryName: "Clothing",
        description: "Apparel and accessories",
        businessId: business.id,
      },
      {
        categoryName: "Services",
        description: "Professional services",
        businessId: business.id,
      },
      {
        categoryName: "Food & Beverage",
        description: "Edible products",
        businessId: business.id,
        parentCategoryId: parentCategory.id,
      },
    ],
  });

  console.log(`Created ${categories.count} product categories`);

  // Get category IDs for reference
  const categoryList = await prisma.productCategory.findMany({
    where: { businessId: business.id },
    select: { id: true, categoryName: true },
  });

  // Seed Products with all required fields
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Premium Wireless Headphones",
        description: "Noise-cancelling Bluetooth 5.0 headphones",
        productCode: "ELEC-001",
        productType: "Product",
        costPrice: 120,
        sellingPrice: 249.99,
        unitOfMeasure: "Each",
        trackInventory: true,
        stockQuantity: 50,
        reorderLevel: 10,
        maxStockLevel: 100,
        taxCategory: "Standard",
        businessId: business.id,
        categoryId: categoryList.find(c => c.categoryName === "Electronics")
          ?.id,
        sku: "SKU-HEAD-001",
        price: 249.99,
      },
      {
        name: "Consulting Service",
        description: "Professional consulting hours",
        productCode: "SERV-001",
        productType: "Service",
        costPrice: 0,
        sellingPrice: 150,
        unitOfMeasure: "Hour",
        trackInventory: false,
        taxCategory: "Service",
        businessId: business.id,
        categoryId: categoryList.find(c => c.categoryName === "Services")?.id,
        price: 150,
      },
      {
        name: "Organic Cotton T-Shirt",
        description: "Premium quality unisex t-shirt",
        productCode: "CLTH-001",
        productType: "Product",
        costPrice: 8.5,
        sellingPrice: 24.99,
        unitOfMeasure: "Each",
        trackInventory: true,
        stockQuantity: 200,
        reorderLevel: 50,
        maxStockLevel: 300,
        taxCategory: "Standard",
        businessId: business.id,
        categoryId: categoryList.find(c => c.categoryName === "Clothing")?.id,
        sku: "SKU-TS-001",
        price: 24.99,
      },
    ],
  });

  console.log(`Created ${products.count} products`);

  // Seed Customers with all fields
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: "Acme Corporation",
        customerCode: "CUST-001",
        customerType: "Business",
        email: "purchasing@acme.com",
        phone: "+1234567890",
        address: "123 Business Rd, Commerce City",
        city: "Metropolis",
        region: "Central",
        taxId: "TAX-12345",
        rccmNumber: "RCCM-54321",
        contactPerson: "John Purchaser",
        creditLimit: 5000,
        paymentTerms: "Net 30",
        businessId: business.id,
      },
      {
        name: "Jane Smith",
        customerCode: "CUST-002",
        customerType: "Individual",
        email: "jane.smith@personal.com",
        phone: "+1987654321",
        address: "456 Residential Ave, Suburbia",
        city: "Smallville",
        region: "West",
        creditLimit: 1000,
        paymentTerms: "Net 15",
        businessId: business.id,
      },
    ],
  });

  console.log(`Created ${customers.count} customers`);

  // Get customer IDs to create contacts
  const customerRecords = await prisma.customer.findMany({
    where: { businessId: business.id },
    select: { id: true, name: true },
  });

  // Seed Customer Contacts
  const contacts = await prisma.customerContact.createMany({
    data: [
      {
        customerId:
          customerRecords.find(c => c.name === "Acme Corporation")?.id || "",
        contactName: "John Purchaser",
        position: "Procurement Manager",
        phone: "+1234567890 ext. 101",
        email: "john.p@acme.com",
        isPrimary: true,
      },
      {
        customerId:
          customerRecords.find(c => c.name === "Acme Corporation")?.id || "",
        contactName: "Sarah Accounts",
        position: "Accounts Payable",
        phone: "+1234567890 ext. 102",
        email: "accounts@acme.com",
      },
      {
        customerId:
          customerRecords.find(c => c.name === "Jane Smith")?.id || "",
        contactName: "Jane Smith",
        phone: "+1987654321",
        email: "jane.smith@personal.com",
        isPrimary: true,
      },
    ],
  });

  console.log(`Created ${contacts.count} customer contacts`);

  // Verification query
  const seedResults = await prisma.$transaction([
    prisma.productCategory.count({ where: { businessId: business.id } }),
    prisma.product.count({ where: { businessId: business.id } }),
    prisma.customer.count({ where: { businessId: business.id } }),
    prisma.customerContact.count(),
  ]);

  console.log("Seed verification:", {
    categories: seedResults[0],
    products: seedResults[1],
    customers: seedResults[2],
    contacts: seedResults[3],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
