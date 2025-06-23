"use server"
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getInventoryDashboardData() {
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

  const businessId = user.organizationId;
  // Load all products
  const products = await prisma.product.findMany({
    where: { businessId },
    include: {
      category: true,
      invoiceItems: true,
      ProductVariant: true,
    },
  });



  const lowStockItems = products
    .filter(
      p =>
        p.trackInventory &&
        (p.reorderLevel ?? 0) > 0 &&
        (p.ProductVariant?.reduce(
          (sum, variant) => sum + (variant.stockQuantity || 0),
          0
        ) || 0) <= (p.reorderLevel ?? 0)
    )
    .map(p => ({
      product: {
        name: p.name,
        stockQuantity:
          p.ProductVariant?.reduce(
            (sum, variant) => sum + (variant.stockQuantity || 0),
            0
          ) || 0,
      },
      threshold: p.reorderLevel,
      message: `Low stock: only ${
        p.ProductVariant?.reduce(
          (sum, variant) => sum + (variant.stockQuantity || 0),
          0
        ) || 0
      } left`,
    }));

  const totalProducts = products.length;
  const totalCategories = await prisma.productCategory.count({
    where: { businessId },
  });

  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.costPrice || 0) * (p.stockQuantity || 0),
    0
  );

  // Group by category
  const stockByCategory = Object.values(
    products.reduce(
      (acc, p) => {
        const cat = p.category?.categoryName || "Uncategorized";
        acc[cat] = acc[cat] || { categoryName: cat, stockQuantity: 0 };

        if (p.trackInventory) {
          acc[cat].stockQuantity += p.stockQuantity || 0;
        }

        return acc;
      },
      {} as Record<string, { categoryName: string; stockQuantity: number }>
    )
  );

  // Top selling products
  const topSellingProducts = products
    .map(p => ({
      name: p.name,
      unitsSold: p.invoiceItems.length,
      salesValue: p.invoiceItems.reduce((sum, item) => sum + item.lineTotal, 0),
    }))
    .sort((a, b) => b.salesValue - a.salesValue)
    .slice(0, 5);

  // AI Recommendations (mocked or real)
  const aiPredictions = await prisma.aiPrediction.findMany({
    where: {
      businessId,
      predictionType: "INVENTORY_RECOMMENDATION",
    },
  });

  const recommendations = aiPredictions.map(pred => ({
    message: pred.predictionResult,
    confidence: pred.confidenceScore,
  }));

  return {
    success: true,
    data: {
      totalProducts,
      totalCategories,
      lowStockCount: lowStockItems.length,
      inventoryValue,
      stockByCategory,
      topSellingProducts,
      lowStockItems,
      aiRecommendations: recommendations,
    },
  };
}
