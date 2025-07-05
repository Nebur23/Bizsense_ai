/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { autoCreateJournalEntry } from "../accounting/journalEntry";

// types/product.ts
interface ProductVariantInput {
  name: string;
  sku: string;
  price: number;
  cost?: number | undefined;
  isActive: boolean;
  stockQuantity?: number;
  attributes: Record<string, any>; // { color: 'red', size: 'XL' }
  barcode?: string;
  image?: string;
}

interface CreateProductInput {
  name: string;
  description: string | undefined;
  sku: string | undefined;
  productCode: string;
  productType: "PRODUCT" | "SERVICE";
  unitOfMeasure: string | undefined;
  price: number | undefined;
  cost: number | undefined;
  trackInventory: boolean;
  reorderLevel: number | undefined;
  maxStockLevel: number | undefined;
  defaultTaxTypeId: string | undefined;
  categoryId: string | undefined;
  image?: string;
  variants?: ProductVariantInput[];
}

export async function getProducts() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    const userId = session?.user.id;

    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.member.findFirst({
      where: { userId: userId },
    });

    if (!user) throw new Error("User not found");

    if (!user.organizationId) throw new Error("User businessId not found");

    // if (!["user", "ADMIN"].includes(user.role)) {
    //   throw new Error(
    //     "Unauthorized: Insufficient permissions to create accounts"
    //   );
    // }

    const businessId = user.organizationId;

    const products = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        ProductVariant: true,
      },
    });

    return products.map(product => ({
      id: product.id,
      image:
        product.image ??
        product.ProductVariant.find(v => v.image)?.image ??
        null,
      productCode: product.productCode,
      name: product.name,
      productType: product.productType,
      description: product.description,
      category: product.category,
      stockQuantity:
        product.ProductVariant?.reduce(
          (sum, variant) => sum + (variant.stockQuantity || 0),
          0
        ) ||
        product.stockQuantity ||
        0,
      trackInventory: product.trackInventory,
      unitOfMeasure: product.unitOfMeasure,
      pricing: (
        (((product.sellingPrice ?? 0) - (product.costPrice ?? 0)) /
          (product.costPrice ?? 1)) *
        100
      ).toFixed(1),
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      isActive: product.isActive,
      reorderLevel: product.reorderLevel,
      businessId,
      defaultTaxId: product.defaultTaxTypeId,
    }));
  } catch (error) {
    console.error("Error fetching products :", error);
    throw new Error("Failed to fetch products ");
  }
}

// Retrieving a product with all variants
export async function getProductWithVariants(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      ProductVariant: {
        where: { isActive: true },
        orderBy: [{ attributes: "asc" }],
      },
      category: true,
      defaultTax: true,
      invoiceItems: true,
    },
  });
}

// app/api/products/create.ts
export async function createProduct(data: CreateProductInput) {
  console.log("Submitting enhanced product data:", data);

  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    const userId = session?.user.id;

    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.member.findFirst({
      where: { userId: userId },
    });

    if (!user) throw new Error("User not found");

    if (!user.organizationId) throw new Error("User businessId not found");

    // if (!["user", "ADMIN"].includes(user.role)) {
    //   throw new Error(
    //     "Unauthorized: Insufficient permissions to create accounts"
    //   );
    // }

    const businessId = user.organizationId;

    // Validate category if provided
    if (data.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: {
          id: data.categoryId,
          businessId,
          isDeleted: false,
        },
      });
      if (!category) throw new Error("Category not found");
    }

    // Validate tax type if provided
    if (data.defaultTaxTypeId) {
      const taxType = await prisma.taxType.findUnique({
        where: {
          id: data.defaultTaxTypeId,
          businessId,
          isDeleted: false,
        },
      });
      if (!taxType) throw new Error("Tax type not found");
    }

    const totalStock = (data.variants ?? []).reduce(
      (sum, variant) => sum + (variant.stockQuantity || 0),
      0
    );

    // Get accounts before transaction to reduce DB calls inside
    const [inventoryAccount, cogsAccount] = await Promise.all([
      prisma.chartOfAccounts.findFirst({
        where: {
          businessId,
          accountCode: "104",
          isActive: true,
          accountType: { name: "Asset" },
        },
        select: { id: true },
      }),
      prisma.chartOfAccounts.findFirst({
        where: {
          businessId,
          accountCode: "501",
          isActive: true,
          accountType: { name: "Expense" },
        },
        select: { id: true },
      }),
    ]);

    if (!inventoryAccount) throw new Error("Inventory account not found");

    if (!cogsAccount) throw new Error("COGS account not found");

    // Create the base product
    const product = await prisma.product.create({
      data: {
        businessId,
        name: data.name,
        description: data.description,
        sku: data.sku,
        productCode: data.productCode,
        productType: data.productType,
        unitOfMeasure: data.unitOfMeasure,
        sellingPrice: data.price,
        costPrice: data.cost || 0,
        trackInventory: data.trackInventory ?? false,
        maxStockLevel: data.maxStockLevel || 0,
        defaultTaxTypeId: data.defaultTaxTypeId,
        categoryId: data.categoryId,
        reorderLevel: data.reorderLevel || 0,
        isActive: true,
        image: data.image ?? null,
      },
      include: {
        category: true,
        defaultTax: true,
      },
    });

    console.log("Created product:", product);

    // Create variants if provided
    if (data.variants && data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map(variant => ({
          productId: product.id,
          variantName: variant.name,
          image: variant.image,
          sku: variant.sku,
          price: variant.price,
          cost: variant.cost ?? 0,
          stockQuantity: variant.stockQuantity || 0,
          attributes: variant.attributes,
          //barcode: variant.barcode,
          isActive: true,
        })),
      });

      // Calculate total stock quantity from variants
      // const totalStock = (data.variants || []).reduce(
      //   (sum, variant) => sum + (variant.stockQuantity || 0),
      //   0
      // );

      // Update product with total stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: totalStock },
      });
    }

    // Create initial stock movement if inventory is tracked
    if (
      data.trackInventory !== false &&
      (data.variants?.length || (product.stockQuantity ?? 0) > 0)
    ) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "PURCHASE",
          quantity: product.stockQuantity ?? 0,
          unitCost: product.costPrice,
          totalCost: (product.costPrice ?? 0) * (product.stockQuantity ?? 0),
          reference: `Initial stock for ${product.productCode}`,
          userId: session.user.id,
          businessId,
        },
      });
    }

    // Auto-create journal entry if inventory tracked
    if (
      data.trackInventory !== false &&
      (data.variants?.length || (product.stockQuantity ?? 0) > 0)
    ) {
      await autoCreateJournalEntry({
        transactionDate: new Date(),
        reference: product.id,
        description: `Initial inventory setup for ${product.name}`,
        lines: [
          {
            accountId: inventoryAccount.id,
            debitAmount: (data.cost ?? 0) * totalStock,
            creditAmount: 0,
            description: `Increase inventory asset`,
          },
          {
            accountId: cogsAccount.id,
            debitAmount: 0,
            creditAmount: (data.cost ?? 0) * totalStock,
            description: `Initial inventory valuation`,
          },
        ],
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        businessId,
        userId: session.user.id,
        action: "CREATE",
        tableName: "Product",
        recordId: product.id,
        newValues: JSON.stringify(product),
      },
    });

    //revalidatePath("/inventory");

    return {
      success: true,
      message: "Product created successfully",
      data: product,
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: error.message || "Failed to create product",
      error: error,
    };
  }
}
