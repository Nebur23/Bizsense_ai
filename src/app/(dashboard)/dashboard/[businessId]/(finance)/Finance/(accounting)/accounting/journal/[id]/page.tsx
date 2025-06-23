import {
  getJournalEntriesByNumber,
  getJournalEntryById,
  JournalEntryId,
} from "@/actions/accounting/journalEntry";
import { JournalEntryDetails } from "@/components/accounting/journals/JournalEntryDetails";
import ButtonUtils from "./buttons-utils";
import Link from "next/link";
import { ReverseJournalEntryButton } from "@/components/accounting/journals/ReverseJournalEntryButton";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journalEntry = await getJournalEntryById(id);
  const reversedEntry = await getJournalEntriesByNumber(
    journalEntry?.reference?.replace(/REv-/i, "") || ""
  );

  return (
    <div className='space-y-6 p-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-xl font-bold'>
          Journal Entry: {journalEntry?.number} - {journalEntry?.date}
        </h1>

        {journalEntry?.reference?.startsWith("REV-") && (
          <div className='bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md'>
            <p>
              This entry has been reversed by:{" "}
              <Link
                href={reversedEntry ? `${reversedEntry.id}` : "#"}
                className='underline font-medium'
              >
                #{journalEntry.reference}
              </Link>
            </p>
          </div>
        )}

        <ButtonUtils />
      </div>

      <div className='printable-area'>
        <JournalEntryDetails entry={journalEntry as JournalEntryId} />
      </div>

      {journalEntry?.status === "Posted" && (
        <div className='mt-6 flex justify-end'>
          <ReverseJournalEntryButton entryId={journalEntry?.id} />
        </div>
      )}
    </div>
  );
}
