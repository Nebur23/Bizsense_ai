"use server";

import React from "react";
import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  react,
  html,
}: {
  to: string;
  subject: string;
  react?: React.ReactNode;
  html?: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "BizSense AI <onboarding@resend.dev>",
      to,
      subject,
      react,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
