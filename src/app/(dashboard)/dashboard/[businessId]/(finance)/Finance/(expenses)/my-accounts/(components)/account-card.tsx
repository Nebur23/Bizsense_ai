"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDefaultAccount } from "@/actions/accounts/update";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/utils";
import { Account } from "@/types";

export function AccountCard({ account }: { account: Account }) {
  const { name, type, balance, id, isDefault, currency } = account;
  const queryClient = useQueryClient();
  const { businessId } = useParams<{ businessId: string }>();

  const editMutation = useMutation({
    mutationFn: async () => {
      return updateDefaultAccount(id);
    },
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      if (response.statusCode === 200) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      // Handle error scenario
      toast.error(error.message);
    },
  });

  const handleDefaultChange = () => {
    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }
    editMutation.mutate();
  };

  return (
    <Card className='hover:shadow-md transition-shadow group relative'>
      <Link href={`/dashboard/${businessId}/Finance/account/${id}`}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium capitalize'>
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={editMutation.isPending}
          />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold mb-1.5'>
            {formatMoney(balance.toFixed(2), currency)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className='flex justify-between text-sm text-muted-foreground'>
          <div className='flex items-center'>
            <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
            Income
          </div>
          <div className='flex items-center'>
            <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
