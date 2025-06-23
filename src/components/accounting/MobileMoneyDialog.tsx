// components/accounting/payment/MobileMoneyDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MobileMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMoneyDialog({ open, onOpenChange }: MobileMoneyDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleSend = () => {
    console.log("Sending via mobile money:", { phoneNumber, transactionId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Mobile Money Transaction</DialogTitle>
          <DialogDescription>
            Enter recipient phone number and transaction ID
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='phone' className='text-right'>
              Phone
            </Label>
            <Input
              id='phone'
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className='col-span-3'
              placeholder='e.g., +237 677 000 000'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='transactionId' className='text-right'>
              Ref ID
            </Label>
            <Input
              id='transactionId'
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              className='col-span-3'
              placeholder='e.g., MMO-1234567890'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend}>Confirm Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
