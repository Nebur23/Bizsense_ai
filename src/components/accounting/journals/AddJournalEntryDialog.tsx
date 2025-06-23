"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddJournalEntryForm } from "./AddJournalEntryForm";

export function AddJournalEntryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>+ New Journal Entry</Button>
        </DialogTrigger>

        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden'>
          <DialogHeader>
            <DialogTitle>Create Journal Entry</DialogTitle>
            <DialogDescription>
              Enter details for manual journal entry
            </DialogDescription>
          </DialogHeader>

          <AddJournalEntryForm
            onSuccess={() => setOpen(false)}
            //onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
