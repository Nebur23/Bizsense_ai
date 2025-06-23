"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SubmitButton } from "@/components/common/SubmitButton";
import CreateBusiness from "@/actions/business/create";

import { GROUPED_BUSINESS_TYPES } from "@/data/business-type";
import { suggestBusinessType } from "@/lib/autoBusinessType";
import { authClient } from "@/lib/auth-client";
import { Business } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Business name is required." }),
  type: z.string().min(1, { message: "Business type is required." }),
});

export default function MyForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const businessName = form.watch("name");

  // Auto-assign type if none has been selected
  useEffect(() => {
    if (!businessName) {
      form.setValue("type", "");
    }

    const suggested = suggestBusinessType(businessName);
    const currentType = form.getValues("type");

    if (suggested && !currentType) {
      form.setValue("type", suggested);
    }
  }, [businessName, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // toast(
    //   <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
    //     <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
    //   </pre>
    // );
    try {
      const { data: session } = await authClient.getSession();
      const user = session?.user;

      if (!user) router.replace("/signin");

      await authClient.organization.create(
        {
          name: values.name,
          slug: `${values.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")}${Math.floor(Math.random() * 1000)}`,
          //type: values.type,
        },
        {
          onResponse: () => {
            // setLoading(false);
          },
          onSuccess: async res => {
            const payload = {
              id: res.data.id,
              type: values.type,
              name: values.name,
            } as Business;

            const biz = await CreateBusiness(payload);
            if (biz.statusCode === 201 && biz.businessId) {
              router.replace(`/dashboard/${biz.businessId}`);
              toast.success(biz.message);
            } else {
              toast.error(biz.message || "Something went wrong");
            }
            //toast.success("Organization created successfully");
          },
          onError: error => {
            toast.error(error.error.message);
            // setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 w-full py-10 px-4 sm:px-0 lg:px-0'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder='e.g., Mama Joy Chips' {...field} />
              </FormControl>
              <FormDescription>
                This is the name customers will see.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select business type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='max-h-[400px] overflow-y-auto'>
                  {GROUPED_BUSINESS_TYPES.map(group => (
                    <SelectGroup key={group.group}>
                      <SelectLabel>{group.group}</SelectLabel>
                      {group.options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className='flex items-start gap-3 text-left'>
                            <option.icon className='w-4 h-4 mt-1 text-muted-foreground' />
                            <div>
                              <p className='font-medium'>{option.label}</p>
                              <p className='text-xs text-muted-foreground'>
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best describes your business.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          form={form}
          loadingText='Submitting...'
          defaultText='Submit'
          variant='default'
          className='w-full'
        />
      </form>
    </Form>
  );
}
