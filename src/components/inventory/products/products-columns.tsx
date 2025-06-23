"use client";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as Img,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type Product = {
  id: string;
  image: string | null;
  productCode: string;
  name: string;
  productType: string;
  description: string | null;
  category: {
    id: string;
    createdAt: Date;
    description: string | null;
    businessId: string;
    defaultTaxTypeId: string | null;
    isActive: boolean;
    isDeleted: boolean;
    categoryName: string;
    parentCategoryId: string | null;
  } | null;
  stockQuantity: number;
  trackInventory: boolean;
  unitOfMeasure: string | null;
  pricing: string;
  sellingPrice: number | null;
  costPrice: number | null;
  isActive: boolean;
  reorderLevel: number | null;
  businessId: string;
};

const getStockStatus = (product: Product) => {
  if (!product.trackInventory)
    return { status: "N/A", color: "text-gray-500", icon: null };
  if (product.stockQuantity === 0)
    return { status: "Out of Stock", color: "text-red-600", icon: XCircle };
  if (product.stockQuantity <= (product.reorderLevel ?? 0))
    return {
      status: "Low Stock",
      color: "text-yellow-600",
      icon: AlertTriangle,
    };
  return { status: "In Stock", color: "text-green-600", icon: CheckCircle };
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Link
          href={`/dashboard/${row.original.businessId}/inventory/products/${row.original.id}`}
          className='flex items-center justify-center'
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={100}
              height={100}
              className='w-12 h-12 rounded-lg object-cover cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-colors'
              // onClick={() => setSelectedImage(product.image)}
            />
          ) : (
            <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
              <Img className='w-6 h-6 text-gray-400' />
            </div>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "productCode",
    header: ({ column }) => {
      return (
        <button
          className='flex items-center space-x-2 hover:text-blue-600'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Code</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </button>
      );
    },
    cell: ({ row }) => (
      <div className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
        {row.getValue("productCode")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <button
          className='flex items-center space-x-2 hover:text-blue-600'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Product/Service Name</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className='space-y-1'>
          <div className='font-medium text-gray-900'>{product.name}</div>
          <div className='text-sm text-gray-500'>{product.description}</div>
          <div className='flex items-center space-x-2'>
            {product.productType === "Product" ? (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                <Package className='w-3 h-3 mr-1' />
                Product
              </span>
            ) : (
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800'>
                <Tag className='w-3 h-3 mr-1' />
                Service
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category?.categoryName;
      return category ? (
        <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm'>
          {category}
        </span>
      ) : (
        <span className='text-gray-400'>No category</span>
      );
    },
  },
  {
    accessorKey: "stockQuantity",
    header: ({ column }) => {
      return (
        <button
          className='flex items-center space-x-2 hover:text-blue-600'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Stock</span>
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      const stockStatus = getStockStatus(product);
      const Icon = stockStatus.icon;

      if (!product.trackInventory) {
        return <span className='text-gray-500'>N/A</span>;
      }

      return (
        <div className='space-y-1'>
          <div className='font-medium'>
            {product.stockQuantity} {product.unitOfMeasure}
          </div>
          <div
            className={`flex items-center space-x-1 text-xs ${stockStatus.color}`}
          >
            {Icon && <Icon className='w-3 h-3' />}
            <span>{stockStatus.status}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "pricing",
    header: "Pricing",
    cell: ({ row }) => {
      const product = row.original;
      const margin =
        product.sellingPrice && product.costPrice
          ? (
              ((product.sellingPrice - product.costPrice) / product.costPrice) *
              100
            ).toFixed(1)
          : "0.0";

      return (
        <div className='space-y-1'>
          <div className='text-sm'>
            <span className='text-gray-600'>Cost: </span>
            <span className='font-medium'>
              {formatCurrency(product.costPrice ?? 0)}
            </span>
          </div>
          <div className='text-sm'>
            <span className='text-gray-600'>Sell: </span>
            <span className='font-medium text-green-600'>
              {formatCurrency(product.sellingPrice ?? 0)}
            </span>
          </div>
          <div className='text-xs text-blue-600'>Margin: {margin}%</div>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
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
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({}) => {
      return (
        <div className='flex items-center space-x-2'>
          <button className='p-1 hover:bg-green-100 rounded transition-colors'>
            <Edit className='w-4 h-4 text-green-600' />
          </button>
          <button className='p-1 hover:bg-red-100 rounded transition-colors'>
            <Trash2 className='w-4 h-4 text-red-600' />
          </button>
        </div>
      );
    },
  },
];
