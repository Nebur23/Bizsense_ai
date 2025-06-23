import { Suspense } from "react";
//import { BarLoader } from "react-spinners";
//import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
//import { AccountChart } from "../_components/account-chart";
import { getAccountWithTransactions } from "@/actions/accounts/get";
import { formatCurrency } from "@/lib/utils";
import { AccountChart } from "../(components)/account-chart";
import Image from "next/image";
import TransactionTable from "../(components)/transaction-table";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const accountData = await getAccountWithTransactions((await params).id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  const trans = transactions.map(({ transaction }) => transaction);

  // const transactionArray: Transaction[] = transactions.map(
  //   accountTransaction => accountTransaction.transaction
  // );

  return (
    <div className='space-y-8  py-7 lg:py-12'>
      <div className='flex gap-4 px-3 items-end justify-between'>
        <div>
          <h1 className='text-4xl sm:text-4xl font-bold tracking-tight gradient-title capitalize'>
            {account.name}
          </h1>
          <p className='text-muted-foreground'>
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className='text-right pb-2'>
          <div className='text-xl sm:text-2xl font-bold'>
            {formatCurrency(account.balance, account.currency)}
          </div>
          <p className='text-sm text-muted-foreground'>
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={
          <Image
            src='/icons/loader.svg'
            alt='loader'
            className='mt-4'
            color='#9333ea'
            width={50}
            height={50}
          />
        }
      >
        <div className='px-3'>
          <AccountChart transactions={trans} />
        </div>
      </Suspense>

      {/* Transactions Table */}

      <Suspense
        fallback={
          <Image
            src='/icons/loader.svg'
            alt='loader'
            className='mt-4'
            color='#9333ea'
            width={50}
            height={50}
          />
        }
      >
        <div className='sm:max-w-fit md:max-w-7xl mx-auto px-3'>
          <TransactionTable transactions={trans} />
        </div>
      </Suspense>
    </div>
  );
}
