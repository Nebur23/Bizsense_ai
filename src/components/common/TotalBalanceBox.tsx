import { formatCurrency } from "@/lib/utils";

const TotalBalanceBox = ({
  accounts = [],
  totalBanks,
}: {
  accounts: Array<{ balance: number }>;
  totalBanks: number;
}) => {
  const totalCurrentBalance = accounts.reduce(
    (acc, account) => acc + account.balance,
    0
  );

  return (
    <div className='flex w-1/2 max-w-full items-center gap-4  border rounded-sm border-gray-200 p-4 shadow-chart sm:gap-6 sm:p-6'>
      <div className='flex size-full max-w-[100px] items-center sm:max-w-[120px]'>
        {/* <DoughnutChart accounts={accounts} /> */}
      </div>

      <div className='flex flex-col gap-6'>
        <h2 className='text-18 font-semibold text-gray-900'>
          My Accounts: {totalBanks}
        </h2>
        <div className='flex flex-col gap-2'>
          <p className='text-14 font-medium text-gray-600'>
            Total Current Balance
          </p>

          <div className='text-24 lg:text-30 flex-1 font-semibold text-gray-900 flex-center gap-2'>
            {formatCurrency(totalCurrentBalance)}
            {/* <AnimatedCounter suffix=' FCFA' amount={totalCurrentBalance} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalBalanceBox;
