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
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";

interface AccountRow {
  code: string;
  name: string;
  type: string;
  description?: string;
}

export function ImportCOADialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AccountRow[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const rows = results.data as Array<{
          Code: string;
          Name: string;
          Type: string;
          Description: string;
        }>;

        const mappedRows = rows.map(row => ({
          code: row.Code,
          name: row.Name,
          type: row.Type,
          description: row.Description,
        }));

        setParsedData(mappedRows);
      },
    });

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    // Implement import logic here using parsedData
    console.log("Importing COA:", parsedData);
    toast.success(`Imported ${parsedData.length} accounts successfully.`);
    setOpen(false);
  };

  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        Import COA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md w-full'>
          <DialogHeader>
            <DialogTitle>Import Chart of Accounts</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing chart of accounts
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <Input type='file' accept='.csv' onChange={handleFileChange} />

            {parsedData.length > 0 && (
              <div className='text-sm text-muted-foreground'>
                {parsedData.length} accounts ready to be imported
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!file}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
