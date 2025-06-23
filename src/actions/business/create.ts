"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Business } from "@/types";
import { headers } from "next/headers";
import { seedDefaultChartOfAccounts } from "../seed-main";

export default async function CreateBusiness(data: Business): Promise<{
  statusCode: number;
  message: string;
  businessId: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    const userId = session?.user.id;
    if (!userId) throw new Error("Unauthorized");

    const { name, type, id } = data;
    if (!name || !type || !id) {
      return {
        statusCode: 403,
        message: "Mising name,id and type fields!",
        businessId: "",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error("User not found");

    const business = await prisma.business.update({
      where: { id },
      data: {
        type,
      },
    });

    //seed default chart of accounts
    await seedDefaultChartOfAccounts(business.id);

    return {
      statusCode: 201,
      message: "Business  successfully created!",
      businessId: business.id,
    };
  } catch (error) {
    console.error("Error creating business:", error);
    return {
      statusCode: 500,
      message: "Something went wrong please retry again!",
      businessId: "",
    };
  }
}
