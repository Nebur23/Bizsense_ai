/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
//import { updateInvoiceRecurringStatus } from "@/lib/actions/accounting/invoice.actions";
import { toast } from "sonner";
import { updateInvoiceRecurringStatus } from "@/actions/accounting/invoices";
import { useRouter } from "next/navigation";

enum RecurringType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}
interface Props {
  invoiceId: string;
  currentIsRecurring: boolean;
  currentRecurringType?: string | null;
  onSuccess?: () => void;
}

export function RecurringInvoiceDialog({
  invoiceId,
  currentIsRecurring,
  currentRecurringType,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(currentIsRecurring);
  const [recurringType, setRecurringType] = useState<RecurringType>(
    currentRecurringType
      ? RecurringType[currentRecurringType as keyof typeof RecurringType]
      : RecurringType.MONTHLY
  );
  const router = useRouter();

  const handleSave = async () => {
    try {
      await updateInvoiceRecurringStatus(invoiceId, isRecurring, recurringType);
      toast.success(`Recurring status ${isRecurring ? "enabled" : "disabled"}`);
      onSuccess?.();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update recurring status");
    }
  };

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
        {currentIsRecurring ? "Edit Recurrence" : "Make Recurring"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Recurrence</DialogTitle>
            <DialogDescription>
              Configure how often this invoice should be generated.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium'>Enable Recurring</label>
              <input
                type='checkbox'
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300'
              />
            </div>

            {isRecurring && (
              <Select
                value={recurringType}
                onValueChange={value =>
                  setRecurringType(
                    RecurringType[value as keyof typeof RecurringType]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select frequency' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DAILY'>Daily</SelectItem>
                  <SelectItem value='WEEKLY'>Weekly</SelectItem>
                  <SelectItem value='MONTHLY'>Monthly</SelectItem>
                  <SelectItem value='QUARTERLY'>Quarterly</SelectItem>
                  <SelectItem value='YEARLY'>Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Recurrence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
