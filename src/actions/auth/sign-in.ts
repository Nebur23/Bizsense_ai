"use server";
import { auth } from "@/lib/auth";

export const signIn = async (dto: { email: string; password: string }) => {
  const { email, password } = dto;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "User successfully logged in",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
