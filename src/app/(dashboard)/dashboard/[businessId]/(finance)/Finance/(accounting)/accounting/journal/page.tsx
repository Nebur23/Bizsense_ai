import { AddJournalEntryDialog } from "@/components/accounting/journals/AddJournalEntryDialog";
import { JournalEntryTable } from "@/components/accounting/journals/JournalEntryTable";

export default function JournalPage() {
  return (
    <div className='space-y-6 p-6 mt-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>General Journal </h1>

        <AddJournalEntryDialog />
      </div>
      <JournalEntryTable />
    </div>
  );
}
