"use client";
import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image,
} from "lucide-react";

// Sample data matching your Product schema
const sampleProducts = [
  {
    id: "prod_001",
    name: "Samsung Galaxy S24",
    description: "Latest Samsung flagship smartphone with advanced features",
    stockQuantity: 25,
    sku: "SAM-S24-001",
    productCode: "PHONE001",
    productType: "Product",
    costPrice: 450000,
    sellingPrice: 650000,
    unitOfMeasure: "Unit",
    reorderLevel: 5,
    maxStockLevel: 100,
    trackInventory: true,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    category: { categoryName: "Electronics" },
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "prod_002",
    name: "iPhone 15 Pro",
    description: "Apple's premium smartphone with titanium design",
    stockQuantity: 12,
    sku: "APL-IP15P-001",
    productCode: "PHONE002",
    productType: "Product",
    costPrice: 550000,
    sellingPrice: 800000,
    unitOfMeasure: "Unit",
    reorderLevel: 3,
    maxStockLevel: 50,
    trackInventory: true,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
    category: { categoryName: "Electronics" },
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "prod_003",
    name: "Dell Laptop Service",
    description: "Professional laptop repair and maintenance service",
    stockQuantity: null,
    sku: "SERV-LAPTOP-001",
    productCode: "SERV001",
    productType: "Service",
    costPrice: 5000,
    sellingPrice: 15000,
    unitOfMeasure: "Hour",
    reorderLevel: 0,
    maxStockLevel: 0,
    trackInventory: false,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop",
    category: { categoryName: "Services" },
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prod_004",
    name: "Office Chair Premium",
    description: "Ergonomic office chair with lumbar support",
    stockQuantity: 8,
    sku: "FURN-CHR-001",
    productCode: "FURN001",
    productType: "Product",
    costPrice: 85000,
    sellingPrice: 125000,
    unitOfMeasure: "Unit",
    reorderLevel: 2,
    maxStockLevel: 20,
    trackInventory: true,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    category: { categoryName: "Furniture" },
    createdAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "prod_005",
    name: "Wireless Earbuds",
    description: "Bluetooth wireless earbuds with noise cancellation",
    stockQuantity: 0,
    sku: "AUD-WEB-001",
    productCode: "AUDIO001",
    productType: "Product",
    costPrice: 15000,
    sellingPrice: 35000,
    unitOfMeasure: "Unit",
    reorderLevel: 10,
    maxStockLevel: 50,
    trackInventory: true,
    isActive: false,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    category: { categoryName: "Electronics" },
    createdAt: "2024-01-05T10:00:00Z",
  },
];

const ProductDataTable = () => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const formatCurrency = amount => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = product => {
    if (!product.trackInventory)
      return { status: "N/A", color: "text-gray-500", icon: null };
    if (product.stockQuantity === 0)
      return { status: "Out of Stock", color: "text-red-600", icon: XCircle };
    if (product.stockQuantity <= product.reorderLevel)
      return {
        status: "Low Stock",
        color: "text-yellow-600",
        icon: AlertTriangle,
      };
    return { status: "In Stock", color: "text-green-600", icon: CheckCircle };
  };

  const columns = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className='flex items-center justify-center'>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className='w-12 h-12 rounded-lg object-cover cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-colors'
                onClick={() => setSelectedImage(product.image)}
              />
            ) : (
              <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
                <Image className='w-6 h-6 text-gray-400' />
              </div>
            )}
          </div>
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
        const margin = (
          ((product.sellingPrice - product.costPrice) / product.costPrice) *
          100
        ).toFixed(1);

        return (
          <div className='space-y-1'>
            <div className='text-sm'>
              <span className='text-gray-600'>Cost: </span>
              <span className='font-medium'>
                {formatCurrency(product.costPrice)}
              </span>
            </div>
            <div className='text-sm'>
              <span className='text-gray-600'>Sell: </span>
              <span className='font-medium text-green-600'>
                {formatCurrency(product.sellingPrice)}
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
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
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
      cell: ({ row }) => {
        return (
          <div className='flex items-center space-x-2'>
            <button className='p-1 hover:bg-blue-100 rounded transition-colors'>
              <Eye className='w-4 h-4 text-blue-600' />
            </button>
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

  const table = useReactTable({
    data: sampleProducts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className='w-full space-y-4 p-6 bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Products & Services
          </h1>
          <p className='text-gray-600'>
            Manage your inventory and service offerings
          </p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors'>
          <Package className='w-4 h-4' />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            placeholder='Search products...'
            value={globalFilter ?? ""}
            onChange={e => setGlobalFilter(String(e.target.value))}
            className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <button className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
          <Filter className='w-4 h-4' />
          <span>Filters</span>
        </button>
      </div>

      {/* Table */}
      <div className='border rounded-lg overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className='hover:bg-gray-50 transition-colors'>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-700'>
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className='px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <span className='px-3 py-1 text-sm'>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className='px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={() => setSelectedImage(null)}
        >
          <div className='bg-white p-4 rounded-lg max-w-2xl max-h-[80vh] overflow-auto'>
            <img
              src={selectedImage}
              alt='Product preview'
              className='max-w-full h-auto rounded-lg'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDataTable;
