// src/app/(protected)/accounting/reconciliation/components/BankStatementUploader.tsx

'use client'

import React, { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function BankStatementUploader({ businessId }: { businessId: string }) {
  const [parsedData, setParsedData] = useState<any[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validLines = results.data.filter(row => row.Date && row.Amount && row.Description)
        setParsedData(validLines)
        toast.success(`Parsed ${validLines.length} transaction lines`)
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const res = await importBankStatement(parsedData, businessId)
      toast.success("Transactions imported successfully")
    } catch (error) {
      toast.error("Failed to import bank statement")
    }
  }

  return (
    <div className="space-y-4">
      <Input type="file" onChange={handleFileUpload} />
      {parsedData.length > 0 && (
        <Button onClick={handleSubmit}>Import {parsedData.length} Lines</Button>
      )}
    </div>
  )
}