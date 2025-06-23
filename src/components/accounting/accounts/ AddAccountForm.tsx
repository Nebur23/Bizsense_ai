"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  createAccount,
  getAccountTypes,
} from "@/actions/accounting/chartOfAccounts";
import { useEffect, useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { AccountType } from "@prisma/client";
import { toast } from "sonner";

const accountSchema = z.object({
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountTypeId: z.number().min(1, "Account type is required"),
  parentAccountId: z.string().optional(),
});

interface AddAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export type AccountFormData = z.infer<typeof accountSchema>;

export function AddAccountForm({ onSuccess, onCancel }: AddAccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountCode: "",
      accountName: "",
      accountTypeId: 1,
    },
  });

  useEffect(() => {
    async function loadAccountTypes() {
      try {
        const types = await getAccountTypes();
        setAccountTypes(types);
      } catch (error) {
        console.error("Failed to load account types:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccountTypes();
  }, []);

  async function onSubmit(values: AccountFormData) {
    setLoading(true);
    try {
      const res = await createAccount(values);
      if (res.success === false) {
        toast.error(res.message);
        return;
      }
      form.reset();
      toast.success(res.message);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='accountCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Code</FormLabel>
              <FormControl>
                <Input placeholder='e.g., 101' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder='e.g., Cash in Hand' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountTypeId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select
                onValueChange={value => field.onChange(Number(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue
                      placeholder={
                        loading
                          ? "Loading account types..."
                          : "Select account type"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='parentAccountId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Account (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select parent account' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Replace with dynamic data */}
                  <SelectItem value='acc-101'>Cash in Hand (101)</SelectItem>
                  <SelectItem value='acc-102'>Bank - BICEC (102)</SelectItem>
                  <SelectItem value='acc-201'>
                    Accounts Payable (201)
                  </SelectItem>
                  <SelectItem value='acc-401'>Sales Revenue (401)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={onCancel} type='button'>
            Cancel
          </Button>
          <Button type='submit' disabled={form.formState.isLoading}>
            {form.formState.isLoading ? "Creating..." : "Create Account"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
