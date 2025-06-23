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
import { useState } from "react";
import { updateInvoiceStatus } from "@/actions/accounting/invoices";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  invoiceId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function InvoiceStatusDialog({
  invoiceId,
  currentStatus,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await updateInvoiceStatus(invoiceId, newStatus);
      if (!res.success) {
        throw new Error(res.message || "Failed to update invoice status");
      }
      toast.success(res.message);
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        Update Status
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
            <DialogDescription>
              Current Status: <strong>{currentStatus}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2'>
            <Button
              disabled={loading || currentStatus === "Paid"}
              onClick={() => handleStatusChange("Sent")}
              variant='secondary'
              className='w-full'
            >
              Mark as Sent
            </Button>
            <Button
              disabled={
                loading || currentStatus === "Paid" || currentStatus === "Draft"
              }
              onClick={() => handleStatusChange("Paid")}
              variant='default'
              className='w-full'
            >
              Mark as Paid
            </Button>
            <Button
              disabled={
                loading ||
                currentStatus === "Overdue" ||
                currentStatus === "Paid"
              }
              onClick={() => handleStatusChange("Overdue")}
              variant='destructive'
              className='w-full'
            >
              Mark as Overdue
            </Button>
            <Button
              disabled={loading}
              onClick={() => handleStatusChange("Cancelled")}
              variant='ghost'
              className='w-full text-red-600'
            >
              Cancel Invoice
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
