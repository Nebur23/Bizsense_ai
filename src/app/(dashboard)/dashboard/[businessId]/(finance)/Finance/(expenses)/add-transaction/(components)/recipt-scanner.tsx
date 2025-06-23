/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { scanReceipt } from "@/actions/transactions/ai-recipt";

export function ReceiptScanner({
  onScanComplete,
}: {
  onScanComplete: (data: any) => void;
}) {
  const fileInputRef = useRef<(HTMLInputElement & HTMLButtonElement) | null>(
    null
  );

  const { mutate: scanReceiptMutate, isPending: isScanning } = useMutation({
    mutationFn: scanReceipt,
    onSuccess: data => {
      if (data) {
        onScanComplete(data);
        console.log("Scanned Data:", data);
        toast.success("Receipt scanned successfully");
      }
    },
    onError: error => {
      toast.error(
        `Error scanning receipt: ${error.message || "Unknown error"}`
      );
    },
  });

  const handleReceiptScan = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    scanReceiptMutate(file);
  };

  return (
    <div className='flex items-center gap-4'>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        capture='environment'
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type='button'
        variant='outline'
        className='w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:text-white transition-all shadow-md'
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className='mr-2 h-4 w-4' />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
