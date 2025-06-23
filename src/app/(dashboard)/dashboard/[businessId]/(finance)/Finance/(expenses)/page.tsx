import { getUserAccounts } from "@/actions/accounts/get";
import { getDashboardData } from "@/actions/dashboard";
import HeaderBox from "@/components/common/HeaderBox";
import TotalBalanceBox from "@/components/common/TotalBalanceBox";
import { Suspense } from "react";
import { RecentTransactions } from "./(components)/Recent-Transaction";

export default async function Dashbord() {
  const transactions = await getDashboardData();

  const accounts = await getUserAccounts();
  return (
    <section className='no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll '>
      <div className='no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 sm:px-8  '>
        <header className='flex flex-col justify-between gap-8'>
          <HeaderBox
            type='greeting'
            title='Welcome'
            subtext='Access and manage your account and transactions efficiently'
          />

          <TotalBalanceBox accounts={accounts} totalBanks={accounts.length} />
        </header>

        <span className='font-semibold font-geist-mono'>
          RECENT TRANSACTIONS
        </span>
        <Suspense
          fallback={
            <div className='flex h-full w-full items-center justify-center'>
              Loading...
            </div>
          }
        >
          <RecentTransactions accounts={accounts} transactions={transactions} />
        </Suspense>
      </div>
    </section>
  );
}
