"use server";
import { auth } from "@/lib/auth";

export const signUp = async (dto: {
  name: string;
  email: string;
  password: string;
  //phone: string;
}) => {
  try {
    const { name, email, password } = dto;
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        //phone,
      },
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    };
  }
};
