import { getJournalEntries } from "@/actions/accounting/journalEntry";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./journal-columns";

export async function JournalEntryTable() {
  const data = await getJournalEntries();

  return <DataTable columns={columns} data={data} />;
}
