/* eslint-disable @typescript-eslint/no-explicit-any */

import { generateRecurringInvoices } from "@/actions/accounting/helper";

export async function GET() {
  try {
    const result = await generateRecurringInvoices();
    return Response.json({
      success: true,
      message: `${result.count} recurring invoices generated`,
      generated: result.generatedInvoices,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to generate recurring invoices",
      },
      { status: 500 }
    );
  }
}
