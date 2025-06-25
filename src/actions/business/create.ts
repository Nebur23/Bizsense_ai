/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { seedDefaultChartOfAccounts, setupDefaultTaxTypes } from "../seed-main";
//import { Business } from "@prisma/client";

export default async function CreateBusiness(data: any): Promise<{
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

    const { name, type, id, phone, location, email, website, city } = data;
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

    console.log("biz data", data);

    const country = location[0];
    const region = location[1];
    const business = await prisma.business.update({
      where: { id },
      data: {
        type,
        location: `${region},${country}`,
        phone,
        email,
        website,
        city,
        region,
      },
    });

    //seed default chart of accounts
    await seedDefaultChartOfAccounts(business.id);

    await setupDefaultTaxTypes(business.id);

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
