"use client";

import CountUp from "react-countup";

const AnimatedCounter = ({
  amount,
  prefix = "",
  suffix,
}: //decimal = 0,
//decimalSeparator = ".",
{
  amount: number;
  prefix?: string;
  suffix: string;
  decimal?: number;
  decimalSeparator?: string;
}) => {
  return (
    <div className='w-full'>
      <CountUp
        //decimals={decimal}
        //decimal={decimalSeparator}
        suffix={suffix}
        prefix={prefix}
        end={amount}
        decimal='s'
      />
    </div>
  );
};

export default AnimatedCounter;
