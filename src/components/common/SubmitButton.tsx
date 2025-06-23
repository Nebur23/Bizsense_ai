/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button"; // Adjust import path as needed
import { UseFormReturn } from "react-hook-form";

interface SubmitButtonProps {
  form?: UseFormReturn<any>;
  isPending?: boolean;
  loadingText?: string;
  defaultText?: string;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"; // Add your Button's variants here
  size?: "default" | "sm" | "lg" | "icon"; // Add your Button's sizes here
  // Add any other Button props your implementation accepts
  onClick?: () => void;
}

export function SubmitButton({
  form,
  loadingText = "Submitting...",
  defaultText = "Submit",
  className,
  variant,
  size,
  isPending,
  onClick,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type='submit'
      disabled={form?.formState.isSubmitting || isPending}
      className={className}
      variant={variant}
      size={size}
      {...props}
      onClick={onClick}
    >
      {form?.formState.isSubmitting || isPending ? (
        <div className='flex items-center'>
          <Spinner className='mr-3' />
          {loadingText}
        </div>
      ) : (
        defaultText
      )}
    </Button>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 text-white ${className}`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  );
}
