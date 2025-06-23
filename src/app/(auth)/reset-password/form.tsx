"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputForm } from "@/components/ui/input-form";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  password: z.string(),
});

export default function MyForm() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => setIsShowPassword(!isShowPassword);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Token is missing. Please check your email.");
    }
  }, [token]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token as string,
      });
      if (error) {
        toast.error("Failed to reset password. Please try again.");
      } else {
        toast.success("Password reset successfully!");
        router.push("/signin");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 max-w-3xl mx-auto py-10'
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='flex flex-row items-center justify-between'>
                <span>Password</span>
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

        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  );
}
