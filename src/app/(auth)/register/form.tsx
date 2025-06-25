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
import { authClient } from "@/lib/auth-client";

const TenantFform = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => setIsShowPassword(!isShowPassword);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { password: "", email: "", name: "", phone: "656421799" },
  });

  async function onSubmit(values: z.infer<typeof authSchema>) {
    // toast(
    //   <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
    //     <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
    //   </pre>
    // );

    const { email, password, name } = values as {
      email: string;
      password: string;
      name: string;
    };

    await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: () => {
          //show loading
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          router.replace("/signin");
          form.reset();
          toast.success("User created successfully!! please verify your email");
        },
        onError: ctx => {
          // display the error message
          console.log("registration error", ctx.error);
          toast.error(ctx.error.message);
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
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>UserName</FormLabel>
                <FormControl>
                  <Input placeholder='your_name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='your_email@gmail.com' {...field} />
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
                <FormLabel>Password</FormLabel>
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
                    placeholder='********'
                    type={isShowPassword ? "text" : "password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
              "Sign Up"
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
          Already have an account?{" "}
          <button
            onClick={() => router.push("/signin")}
            className='underline underline-offset-4'
          >
            Sign in
          </button>
        </span>
      </div>
    </>
  );
};

export default TenantFform;
