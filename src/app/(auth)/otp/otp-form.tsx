"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSearchParams } from "next/navigation";
import { otpVerifyActions } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { otpSchema } from "@/schema/auth.schema";

export default function InputOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof otpSchema>) {
    const res = await otpVerifyActions(data, token as string);

    if (res.data.statusCode === 200) {
      toast.success(res.message);

      router.replace("/");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className='max-w-lg md:px-0 mx-5 w-full md:mx-auto border-stone-200 border sm:rounded-lg sm:shadow-md dark:border-stone-700'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full p-5 flex flex-col justify-center items-center'
        >
          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-3xl text-center'>
                  Verification de l&apos;OTP
                </FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSeparator />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                Veuillez entrer le mot de passe à usage unique envoyé à votre e-mail.
                </FormDescription>
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
              <span>Soumettre</span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
