import Image from "next/image";

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
            <CardTitle className='text-2xl'>
              <Image
                alt='logo'
                width={100}
                height={100}
                className='relative mx-auto h-20 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400'
                src='/icons/logo.png'
              />
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
