/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { CheckCircle, XCircle } from "lucide-react";

export type Category = {
  id: string;
  categoryName: string;
  description: string | null;
  products: any[];
  isActive: boolean;
  businessId: string;
  type: string;
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/${row.original.businessId}/inventory/categories/${row.original.id}`}
        className='font-medium hover:underline'
      >
        {row.getValue("categoryName")}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "products",
    header: "Products Count",
    cell: ({ row }) => `${(row.getValue("products") as any[]).length} items`,
  },

  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as string;
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? (
            <>
              <CheckCircle className='w-3 h-3 mr-1' />
              Active
            </>
          ) : (
            <>
              <XCircle className='w-3 h-3 mr-1' />
              Inactive
            </>
          )}
        </span>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const cat = row.original;

      return (
        <div className='flex gap-2'>
          <EditCategoryDialog categoryId={cat.id} />
        </div>
      );
    },
  },
];
