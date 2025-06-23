"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAccounts } from "@/actions/accounts/get";
import { AccountCard } from "./account-card";
import { AccountCardShimmer } from "./account-card-shimmer";
import { CreateAccountDrawer } from "@/components/common/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Account } from "@/types";

const AccountGrid = () => {
  const { isPending, data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getUserAccounts,
  });
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {accounts && accounts?.length < 9 && (
        <CreateAccountDrawer>
          <Card className='hover:shadow-md transition-shadow cursor-pointer border-dashed'>
            <CardContent className='flex flex-col items-center justify-center text-muted-foreground h-full pt-5'>
              <Plus className='h-10 w-10 mb-2' />
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
      )}
      <UserAccounts isPending={isPending} accounts={accounts as Account[]} />
    </div>
  );
};

export default AccountGrid;

const UserAccounts = ({
  isPending,
  accounts,
}: {
  isPending: boolean;
  accounts: Account[];
}) => {
  if (isPending)
    return (
      <>
        <AccountCardShimmer />
        <AccountCardShimmer />
        <AccountCardShimmer />
        <AccountCardShimmer />
      </>
    );

  return (
    <>
      {accounts &&
        accounts.length > 0 &&
        accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))}
    </>
  );
};
