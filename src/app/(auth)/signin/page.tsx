import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TenantFform from "./form";
import { Metadata } from "next";
import Logo from "@/components/common/Logo";

export const metadata: Metadata = {
  title: "Login | BizSense AI",
};

export default function LoginPage() {
  return (
    <>
      <div
        className={cn(
          "flex flex-col mx-5 py-10 sm:mx-auto sm:w-full sm:max-w-md "
        )}
      >
        <Card className='border-stone-200 border sm:rounded-lg sm:shadow-md dark:border-stone-700'>
          <CardHeader>
            <CardTitle className='flex items-center justify-center'>
              <Logo />
            </CardTitle>
            <CardDescription>
              <h1 className='mt-6 text-center font-cal text-3xl dark:text-white'>
                Sign in to BizSense AI
              </h1>
              <p className='mt-2 text-center text-sm text-stone-600 dark:text-stone-400'></p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TenantFform />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
