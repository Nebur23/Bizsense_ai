"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense, useState } from "react";
import { authSchema } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { InputForm } from "@/components/ui/input-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const TenantFform = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => setIsShowPassword(!isShowPassword);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { password: "", email: "" },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof authSchema>) {
    toast(
      <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
      </pre>
    );

    const { email, password, rememberMe } = values as {
      email: string;
      password: string;
      rememberMe: boolean;
    };
    await authClient.signIn.email(
      {
        /**
         * The user email
         */
        email,
        /**
         * The user password
         */
        password,
        /**
         * A URL to redirect to after the user verifies their email (optional)
         */
        callbackURL: "/dashboard",
        /**
         * remember the user session after the browser is closed.
         * @default true
         */
        rememberMe, // ok
      },
      {
        //callbacks
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          router.replace("/dashboard");
          toast.success("User successfully logged in");
          form.reset();
        },
        onError: ctx => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address");
          } else {
            // display the error message
            toast.error(ctx.error.message);
          }
        },
      }
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 max-w-lg px-5 md:px-0 w-full mx-auto'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='your_eamil@gmail.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex flex-row items-center justify-between'>
                  <span>Password</span>

                  <Link href='/forgot-password' className='hover:underline'>
                    Forgot your password?
                  </Link>
                </FormLabel>
                <FormControl>
                  <InputForm
                    icon={
                      isShowPassword ? (
                        <Eye
                          className='w-4 h-4 text-[#155FA0]'
                          onClick={toggleShowPassword}
                        />
                      ) : (
                        <EyeOff
                          className='w-4 h-4 text-[#155FA0]'
                          onClick={toggleShowPassword}
                        />
                      )
                    }
                    placeholder='**********'
                    type={isShowPassword ? "text" : "password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='rememberMe'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <Label htmlFor='rememberMe'>Remember me</Label>
              </FormItem>
            )}
          />

          <Button
            disabled={form.formState.isSubmitting}
            type='submit'
            className='w-full'
          >
            {form.formState.isSubmitting ? (
              <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-stone-400'></div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <div className='mx-auto mt-4 w-full'>
        <Suspense
          fallback={
            <div className='my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800' />
          }
        >
          {/* <LoginButton /> */}
        </Suspense>
      </div>
      <div className='mt-4 text-center text-sm'>
        <span>
          Don&apos;t have an account?
          <button
            onClick={() => router.push("/register")}
            className='underline underline-offset-4'
          >
            Register
          </button>
        </span>
      </div>
    </>
  );
};

export default TenantFform;
