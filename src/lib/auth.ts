/* eslint-disable @typescript-eslint/no-explicit-any */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, twoFactor, emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/actions/send-email";
import { reactResetPasswordEmail } from "../../emails/reset-password";
import { reactInvitationEmail } from "../../emails/invitation";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite", // or "mysql", "postgresql", ...etc
  }),
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    //minPasswordLength: 3,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  accounts: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "demo-app"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    organization({
      schema: {
        organization: {
          modelName: "Business",
        },
      },
      allowUserToCreateOrganization: true,
      organizationCreation: {
        disabled: false,
      },
      async sendInvitationEmail(data: any) {
        await sendEmail({
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${
                    process.env.BETTER_AUTH_URL ||
                    "https://demo.better-auth.com"
                  }/accept-invitation/${data.id}`,
          }),
        });
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail({
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
        await sendEmail({
          to: email,
          subject: "Your Email Verification OTP",
          html: `Your OTP is ${otp}`,
        });
      },
    }),
    // admin({
    //   adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
    // }),
    admin(),
    nextCookies(),
  ], // make sure this is the last plugin in the array
});
