"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { z } from "zod";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitButton } from "./SubmitButton";
import { createAccount } from "@/actions/accounts/create";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  provider: z.string(),
  accountNumber: z.string().nullable(),
  balance: z.number().min(1, "Initial balance is required"),
  isDefault: z.boolean(),
  currency: z.string(),
});

export function CreateAccountDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      balance: 0,
      currency: "XAF",
      accountNumber: "",
      isDefault: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAccount) => {
      return createAccount(data);
    },
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      if (response.statusCode === 201) {
        toast.success(response.message);
        form.reset();
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      // Handle error scenario
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast(
        <pre className='mt-2 w-full max-w-sm rounded-md bg-slate-950 p-4 overflow-x-auto'>
          <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
      createMutation.mutate(values);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className='max-h-[95vh]'>
        <div className='h-full flex flex-col'>
          <DrawerHeader className='flex-shrink-0 text-center'>
            <DrawerTitle className='text-3xl'>Create New Account</DrawerTitle>
          </DrawerHeader>

          <div className='flex-grow overflow-y-auto px-4'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 w-full max-w-lg mx-auto pb-4'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='E.g., Business Cash, MTN Mobile Money, Bank Account'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder='Select type'
                                defaultValue={field.value}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='CASH'>CASH</SelectItem>
                            <SelectItem value='MOBILE_MONEY'>
                              MOBILE MONEY
                            </SelectItem>
                            <SelectItem value='BANK'>BANK</SelectItem>
                            <SelectItem value='CREDIT'>CREDIT</SelectItem>
                            <SelectItem value='OTHER'>OTHER</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select provider' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='MTN'>MTN</SelectItem>
                            <SelectItem value='Orange'>Orange</SelectItem>
                            <SelectItem value='Cash'>Cash</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='accountNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Account number or phone number'
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='balance'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Balance</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='25000.00'
                            type='number'
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            //value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='isDefault'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel>Set as Default</FormLabel>
                        <FormDescription className='text-sm'>
                          This account will be selected by default for
                          transactions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <DrawerFooter className='flex-shrink-0 px-4 pt-2 pb-4 mb-3'>
            <div className='flex flex-col sm:flex-row gap-2 w-full max-w-lg mx-auto'>
              <DrawerClose asChild>
                <Button type='button' variant='outline' className='flex-1'>
                  Cancel
                </Button>
              </DrawerClose>

              <SubmitButton
                isPending={createMutation.isPending}
                defaultText='Create Account'
                loadingText='Creating...'
                onClick={form.handleSubmit(onSubmit)}
                className='flex-1'
              />
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
