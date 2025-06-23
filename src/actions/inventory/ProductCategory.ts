/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Category } from "@/components/inventory/category/category-columns";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getProductCategories(): Promise<Category[]> {
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

  const categories = await prisma.productCategory.findMany({
    where: {
      businessId,
      isDeleted: false,
    },
    include: {
      products: true,
      parentCategory: true,
      business: true,
    },
  });

  //console.log("accounts", JSON.stringify(accounts, null, 2));

  return categories.map(cat => ({
    id: cat.id,
    categoryName: cat.categoryName,
    description: cat.description,
    products: cat.products,
    isActive: cat.isActive,
    businessId: cat.businessId,
    type: cat.isActive ? "Active" : "InActive",
  }));
}

export async function getProductCategory(id: string) {
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
  const category = await prisma.productCategory.findUnique({
    where: { id, businessId },
    include: {
      products: true,
      subCategories: true,
      parentCategory: true,
    },
  });

  console.log("category by Id", category);

  return category;
}

export async function createProductCategory(data: {
  name: string;
  isActive: boolean;
  description?: string | undefined;
  parentId?: string | undefined;
  defaultTaxTypeId?: string | undefined;
}) {
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

    const category = await prisma.productCategory.create({
      data: {
        businessId,
        categoryName: data.name,
        description: data.description || "",
        isActive: data.isActive ?? true,
        parentCategoryId: data.parentId || null,
        defaultTaxTypeId: data.defaultTaxTypeId,
      },
    });

    return {
      success: true,
      message: "Category created successfully",
      data: category,
    };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: error.message || "Failed to create category",
    };
  }
}

export async function updateProductCategory(id: string, data: any) {
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

    const updated = await prisma.productCategory.update({
      where: { id, businessId },
      data: {
        categoryName: data.categoryName,
        description: data.description || "",
        isActive: data.isActive ?? true,
        parentCategoryId: data.parentId || null,
      },
    });

    //revalidatePath("/inventory/categories");
    return {
      success: true,
      message: "Category updated successfully",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: error.message || "Failed to update category",
    };
  }
}
