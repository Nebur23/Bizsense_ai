import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditJournalEntryForm } from "./EditJournalEntryForm";
import { useState } from "react";
import { JournalEntryFormData } from "./AddJournalEntryForm";
import { JournalEntryUpdateInput } from "@/actions/accounting/journalEntry";

interface Props {
  entry: JournalEntryUpdateInput;
  entryNumber: string;
  entryId: string;
  onSuccess?: () => void;
}

export function EditJournalEntryDialog({
  entryNumber,
  entry,
  entryId,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);

  const defaultValues: JournalEntryFormData = {
    transactionDate: entry.transactionDate,
    description: entry.description,
    lines: [
      {
        accountId: entry.lines[0].accountId,
        debitAmount: entry.lines[0].debitAmount,
        creditAmount: entry.lines[0].creditAmount,
        description: entry.lines[0].description,
      },
      ...entry.lines.slice(1).map(line => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        description: line.description,
      })),
    ],
  };

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden'>
          <DialogHeader>
            <DialogTitle>Edit Journal Entry: {entryNumber}</DialogTitle>
            <DialogDescription>
              Review and update journal details
            </DialogDescription>
          </DialogHeader>

          <EditJournalEntryForm
            entryId={entryId}
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
