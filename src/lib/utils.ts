import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirstName(fullName: string) {
  if (!fullName || typeof fullName !== "string") {
    return ""; // or you could throw an error
  }

  // Trim whitespace and split by spaces
  const names = fullName.trim().split(/\s+/);

  // Return the first part (or empty string if no parts)
  return names[0] || "";
}

/**
 * Format a number as currency with thousand separators, decimals, and currency code.
 * e.g., 5000.45 => "5,000.45 XAF"
 *
 * @param value - The amount to format (number or string)
 * @param currency - Currency code to append (default: "XAF")
 * @param minDecimals - Minimum decimal digits (default: 0)
 * @param maxDecimals - Maximum decimal digits (default: 2)
 * @returns Formatted money string
 */
export function formatMoney(
  value: number | string,
  currency: string = "XAF",
  minDecimals: number = 0,
  maxDecimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return `0 ${currency}`;
  }

  const amount = parseFloat(String(value));

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  return `${formatted} ${currency}`;
}

export const formatCurrency = (value: number, currency: string = "XAF") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0, // XAF typically doesn't use decimal places
  }).format(value);
};

export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
