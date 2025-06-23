// components/account-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

type AccountAllocation = {
  accountId: string;
  amount: number;
};

interface AccountSelectorProps {
  totalAmount: number;
  onChange: (allocations: AccountAllocation[]) => void;
}

export function AccountSelector({
  totalAmount,
  onChange,
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allocations, setAllocations] = useState<AccountAllocation[]>([]);
  const [remaining, setRemaining] = useState(totalAmount);

  useEffect(() => {
    // Fetch accounts
    fetch("/api/accounts")
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        // Pre-select default account if available
        const defaultAccount = data.find((a: Account) => a.isDefault);
        if (defaultAccount) {
          setAllocations([
            { accountId: defaultAccount.id, amount: totalAmount },
          ]);
        }
      });
  }, []);

  useEffect(() => {
    // Recalculate remaining amount
    const allocated = allocations.reduce((sum, item) => sum + item.amount, 0);
    setRemaining(totalAmount - allocated);

    // Notify parent component
    onChange(allocations);
  }, [allocations, totalAmount]);

  // Add account allocation
  const addAllocation = () => {
    // Find first unused account
    const usedIds = allocations.map(a => a.accountId);
    const availableAccount = accounts.find(a => !usedIds.includes(a.id));

    if (availableAccount) {
      setAllocations([
        ...allocations,
        { accountId: availableAccount.id, amount: 0 },
      ]);
    }
  };

  // Update allocation amount
  const updateAmount = (index: number, amount: number) => {
    const newAllocations = [...allocations];
    newAllocations[index].amount = amount;
    setAllocations(newAllocations);
  };

  // Update account selection
  const updateAccount = (index: number, accountId: string) => {
    const newAllocations = [...allocations];
    newAllocations[index].accountId = accountId;
    setAllocations(newAllocations);
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between'>
        <h3 className='text-lg font-medium'>Payment Methods</h3>
        <span className={remaining !== 0 ? "text-red-500" : "text-green-500"}>
          Remaining: {remaining.toFixed(2)} XAF
        </span>
      </div>

      {allocations.map((allocation, index) => (
        <div key={index} className='flex gap-2 items-center'>
          <Select
            value={allocation.accountId}
            onValueChange={value => updateAccount(index, value)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select account' />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.balance.toFixed(2)} XAF)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type='number'
            value={allocation.amount}
            onChange={e => updateAmount(index, parseFloat(e.target.value) || 0)}
            className='w-[150px]'
          />

          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              setAllocations(allocations.filter((_, i) => i !== index));
            }}
          >
            ×
          </Button>
        </div>
      ))}

      {allocations.length < accounts.length && (
        <Button variant='outline' size='sm' onClick={addAllocation}>
          Add Payment Method
        </Button>
      )}

      {remaining !== 0 && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            if (allocations.length > 0) {
              // Adjust the first allocation to cover the full amount
              const newAllocations = [...allocations];
              newAllocations[0].amount = totalAmount;
              setAllocations(newAllocations);
            }
          }}
        >
          Balance Automatically
        </Button>
      )}
    </div>
  );
}
