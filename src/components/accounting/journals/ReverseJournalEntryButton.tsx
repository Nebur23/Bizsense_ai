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
import { reverseJournalEntry } from "@/actions/accounting/journalEntry";
import { toast } from "sonner";

interface Props {
  entryId: string;
}

export function ReverseJournalEntryButton({ entryId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReverse = async () => {
    setLoading(true);
    try {
      await reverseJournalEntry(entryId);
      toast.success("Journal entry reversed successfully");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reverse journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        Reverse
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to reverse this journal entry? This will
              create a new entry with opposite values.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleReverse}
              disabled={loading}
            >
              {loading ? "Reversing..." : "Confirm Reversal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
