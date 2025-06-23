"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as React from "react";

interface Props {
  customers: { id: string; name: string }[];
  onFilterChange: (filters: { customer?: string; status?: string }) => void;
}

export function InvoiceFilters({ customers, onFilterChange }: Props) {
  const [customer, setCustomer] = React.useState("");
  const [status, setStatus] = React.useState("");

  const applyFilters = () => {
    onFilterChange({ customer, status });
  };

  return (
    <div className='flex flex-wrap gap-4 mb-6'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Filter by Customer</label>
        <Select value={customer} onValueChange={setCustomer}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='All Customers' />
          </SelectTrigger>
          <SelectContent>
            {customers.map(cust => (
              <SelectItem key={cust.id} value={cust.id}>
                {cust.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Filter by Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Draft'>Draft</SelectItem>
            <SelectItem value='Sent'>Sent</SelectItem>
            <SelectItem value='Paid'>Paid</SelectItem>
            <SelectItem value='Overdue'>Overdue</SelectItem>
            <SelectItem value='Cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2 pt-7'>
        <Button variant='outline' onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
