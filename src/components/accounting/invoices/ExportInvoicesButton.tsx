"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
}
interface Props {
  invoices: Invoice[];
}
export function ExportInvoicesButton({ invoices }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (!invoices || invoices.length === 0) {
      toast.info("No invoices to export.");
      return;
    }

    setLoading(true);

    // Convert invoice data to CSV format
    const csvRows = [];

    // Add header row
    csvRows.push(
      ["Invoice #", "Customer", "Amount (XAF)", "Due Date", "Status"].join(",")
    );

    // Add invoice rows
    for (const inv of invoices) {
      csvRows.push(
        [
          `"${inv.number}"`,
          `"${inv.customer}"`,
          `"${inv.amount.toLocaleString()}"`,
          `"${new Date(inv.dueDate).toLocaleDateString()}"`,
          `"${inv.status}"`,
        ].join(",")
      );
    }

    // Create CSV content
    const csvData = csvRows.join("\n");

    // Create a Blob and download it
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `invoices-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
