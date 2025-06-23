/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type TaxType = {
  id: string;
  code: string;
  name: string;
  authority: string;
  rate: number;
  status: string;
};

interface CreateTaxTypeData {
  name: string;
  code: string;
  rate: number;
  authority?: string;
  description?: string;
}

interface UpdateTaxTypeData {
  name?: string;
  rate?: number;
  authority?: string;
  code?: string;
  isActive?: boolean;
}

export async function getTaxTypes(): Promise<TaxType[]> {
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

    const taxes = await prisma.taxType.findMany({
      where: {
        businessId,
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        taxCode: "asc",
      },
    });
    return taxes.map(tax => ({
      id: tax.id,
      code: tax.taxCode,
      name: tax.taxName,
      authority: tax.taxAuthority || "",
      rate: tax.taxRate,
      status: tax.isActive ? "Active" : "Inactive",
    }));
  } catch (error) {
    console.error("Error fetching tax types:", error);
    throw new Error("Failed to fetch tax types");
  }
}

//Create tax type
export async function createTaxType(data: CreateTaxTypeData) {
  try {
    // 1. Authentication and Authorization
    console.log("Creating tax:", data);
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

    // 3. Validate permissions (only admins/owners can create tax types)
    // if (!["OWNER", "ADMIN"].includes(userMembership.role)) {
    //   throw new Error(
    //     "Unauthorized: Insufficient permissions to create tax types"
    //   );
    // }

    // 4. Validate tax code uniqueness within the business
    const existingTaxType = await prisma.taxType.findFirst({
      where: {
        businessId,
        taxCode: data.code,
      },
    });

    if (existingTaxType) {
      if (existingTaxType.isDeleted) {
        // Option 1: Restore the record
        await prisma.taxType.update({
          where: { id: existingTaxType.id },
          data: {
            isDeleted: false,
            isActive: true,
            taxName: data.name,
            taxRate: data.rate,
            taxAuthority: data.authority || null,
          },
        });
        return {
          success: true,
          message: "Tax type created successfully",
          data: existingTaxType,
        };
      } else {
        // Option 2: Already active
        return {
          success: false,
          message: `Tax type with code ${data.code} already exists`,
        };
      }
    }

    // 5. Validate tax rate is a positive number
    if (data.rate <= 0 || data.rate > 100) {
      throw new Error("Tax rate must be between 0 and 100");
    }

    const validTaxCodes = ["VAT", "CIT", "WHT", "STAMP"];
    if (!validTaxCodes.includes(data.code)) {
      return {
        success: false,
        message: `Invalid tax code. Must be one of: ${validTaxCodes.join(", ")}`,
      };
    }

    // 6. Create the tax type in a transaction
    const newTaxType = await prisma.$transaction(async prisma => {
      const taxType = await prisma.taxType.create({
        data: {
          businessId,
          taxName: data.name,
          taxCode: data.code,
          taxRate: data.rate,
          taxAuthority: data.authority || null,
          //description: data.description || "",
          isActive: true,
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "CREATE",
          tableName: "TaxType",
          recordId: taxType.id,
          newValues: JSON.stringify(taxType),
        },
      });

      return taxType;
    });

    // 7. Revalidate relevant paths
    revalidatePath("/taxes");
    revalidatePath("/api/tax-types");
    revalidatePath("/accounting/taxes");

    return {
      success: true,
      message: "Tax type created successfully",
      data: newTaxType,
    };
  } catch (error: any) {
    console.error("Error creating tax type:", error);
    return {
      success: false,
      message: error.message || "Failed to create tax type",
      error: error,
    };
  }
}
//Update tax type
export async function updateTaxType(
  taxTypeId: string,
  data: UpdateTaxTypeData
) {
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

    // Get existing tax type
    const existingTaxType = await prisma.taxType.findUnique({
      where: { id: taxTypeId, businessId },
    });

    if (!existingTaxType) {
      throw new Error("Tax type not found or doesn't belong to your business");
    }

    // Validate tax rate
    if (data.rate !== undefined && (data.rate <= 0 || data.rate > 100)) {
      throw new Error("Tax rate must be between 0 and 100");
    }

    const updatedTaxType = await prisma.$transaction(async prisma => {
      const taxType = await prisma.taxType.update({
        where: { id: taxTypeId },
        data: {
          taxName: data.name || existingTaxType.taxName,
          taxCode: data.code || existingTaxType.taxCode,
          taxRate:
            data.rate !== undefined ? data.rate : existingTaxType.taxRate,
          taxAuthority: data.authority || existingTaxType.taxAuthority,
          isActive:
            data.isActive !== undefined
              ? data.isActive
              : existingTaxType.isActive,
        },
      });

      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "UPDATE",
          tableName: "TaxType",
          recordId: taxTypeId,
          oldValues: JSON.stringify(existingTaxType),
          newValues: JSON.stringify(taxType),
        },
      });

      return taxType;
    });

    //revalidatePath(["/taxes", "/api/tax-types"]);

    return {
      success: true,
      message: "Tax type updated successfully",
      data: updatedTaxType,
    };
  } catch (error: any) {
    console.error("Error updating tax type:", error);
    return {
      success: false,
      message: error.message || "Failed to update tax type",
      error: error,
    };
  }
}

// Delete tax type

export async function deleteTaxType(taxTypeId: string) {
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

    // Check if tax type is used in transactions
    const isUsed =
      (await prisma.taxReturn.count({
        where: { taxId: taxTypeId },
      })) > 0;

    if (isUsed) {
      throw new Error("Cannot delete tax type with existing tax returns");
    }

    // Soft delete
    const deletedTaxType = await prisma.$transaction(async prisma => {
      const taxType = await prisma.taxType.update({
        where: { id: taxTypeId },
        data: { isActive: false, isDeleted: true },
      });

      await prisma.auditLog.create({
        data: {
          businessId,
          userId: session.user.id,
          action: "DELETE",
          tableName: "TaxType",
          recordId: taxTypeId,
          oldValues: JSON.stringify(taxType),
        },
      });

      return taxType;
    });

    //revalidatePaths(["/taxes"]);

    return {
      success: true,
      message: "Tax type deleted successfully",
      data: deletedTaxType,
    };
  } catch (error: any) {
    console.error("Error deleting tax type:", error);
    return {
      success: false,
      message: error.message || "Failed to delete tax type",
      error: error,
    };
  }
}
