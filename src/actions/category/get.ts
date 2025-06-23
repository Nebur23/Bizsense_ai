"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Category } from "@prisma/client";
import { headers } from "next/headers";

export async function getCategories(): Promise<Category[]> {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  const userId = session?.user.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const categories = await prisma.category.findMany();

  //console.log("accounts", JSON.stringify(accounts, null, 2));

  return categories;
}
