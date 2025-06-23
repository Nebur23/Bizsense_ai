"use client";
import { Button } from "@/components/ui/button";
import { InvoicePdfTemplate } from "./InvoicePdfTemplate";
import { pdf } from "@react-pdf/renderer";

interface Props {
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    customer: {
      name: string;
      phone?: string;
      email?: string;
    };
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      lineTotal: number;
    }>;
    payments: Array<{
      paymentNumber: string;
      amount: number;
      paymentDate: string;
      method: string;
    }>;
  };
}

export function PdfExportButton({ invoice }: Props) {
  const handleDownload = async () => {
    const blob = await pdf(<InvoicePdfTemplate invoice={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant='outline' onClick={handleDownload}>
      Download PDF
    </Button>
  );
}
