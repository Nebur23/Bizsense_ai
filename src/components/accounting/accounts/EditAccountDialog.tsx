/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditAccountForm } from "./EditAccountForm";
import { useState } from "react";

interface Props {
  accountId: string;
  defaultValues: any;
  onSuccess?: () => void;
}

export function EditAccountDialog({
  accountId,
  defaultValues,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md w-full'>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account details</DialogDescription>
          </DialogHeader>

          <EditAccountForm
            accountId={accountId}
            defaultValues={defaultValues}
            onSuccess={() => {
              onSuccess?.();
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
