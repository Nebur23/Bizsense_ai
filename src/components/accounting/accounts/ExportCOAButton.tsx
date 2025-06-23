"use client";
import { Button } from "@/components/ui/button";

interface Account {
  code: string;
  name: string;
  type: string;
  description?: string;
}
interface Props {
  coaData: Account[];
}
export function ExportCOAButton({ coaData }: Props) {
  const handleExport = () => {
    if (!coaData || coaData.length === 0) {
      alert("No account data to export.");
      return;
    }

    const csvData = [
      ["Code", "Name", "Type", "Description"],
      ...coaData.map(acc => [
        acc.code,
        `"${acc.name}"`,
        acc.type,
        `"${acc.description || ""}"`,
      ]),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `chart-of-accounts-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant='outline' size='sm' onClick={handleExport}>
      Export COA
    </Button>
  );
}
