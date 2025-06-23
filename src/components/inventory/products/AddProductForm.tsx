/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaxTypes } from "@/actions/accounting/taxes";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/inventory/Products";
import { getProductCategories } from "@/actions/inventory/ProductCategory";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Download, FileText, Wand2, Check, X } from "lucide-react";
import { VariantImageUploader } from "./VariantImageUploader";
import { convertImageToBase64 } from "@/lib/utils";
import Image from "next/image";

const CAMEROON_UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Liter (l)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "pcs", label: "Pieces" },
  { value: "carton", label: "Carton" },
  { value: "bag", label: "Bag" },
  { value: "bundle", label: "Bundle" },
  { value: "pack", label: "Pack" },
  { value: "m", label: "Meter (m)" },
  { value: "cm", label: "Centimeter (cm)" },
];

const COMMON_VARIANTS = [
  "Color",
  "Size",
  "Model",
  "Capacity",
  "Style",
  "Material",
  "Brand",
  "Version",
];

const schema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    sku: z.string().optional(),
    productCode: z.string().min(1, "Product code is required"),
    productType: z.enum(["PRODUCT", "SERVICE"]),
    unitOfMeasure: z.string().optional(),
    price: z.number().min(0.01, "Base price must be valid").optional(),
    cost: z.number().optional(),
    trackInventory: z.boolean().default(false),
    reorderLevel: z.number().optional(),
    maxStockLevel: z.number().optional(),
    defaultTaxTypeId: z.string().optional(),
    categoryId: z.string().optional(),
    hasVariants: z.boolean().default(false),
    autoGenerateSku: z.boolean().default(true),
    image: z.string().optional(), // URLs or base64 strings
    variants: z
      .array(
        z.object({
          name: z.string().min(1, "Variant name is required"),
          sku: z.string().min(1, "SKU is required"),
          price: z.number().min(0.01, "Price must be valid"),
          cost: z.number().optional(),
          stockQuantity: z.number().min(0, "Stock quantity must be valid"),
          reservedQuantity: z.number().default(0),
          attributes: z.record(z.string()),
          barcode: z.string().optional(),
          isActive: z.boolean().default(true),
          image: z.string().optional(), // <-- changed from images: z.array(...)
        })
      )
      .optional(),
  })
  .refine(
    data => {
      // Validate unique SKUs among variants
      if (data.variants && data.variants.length > 1) {
        const skus = data.variants.map(v => v.sku);
        const uniqueSkus = new Set(skus);
        return uniqueSkus.size === skus.length;
      }
      return true;
    },
    {
      message: "All variant SKUs must be unique",
      path: ["variants"],
    }
  );

// Auto-generate SKU utility
const generateSku = (
  productCode: string,
  attributes: Record<string, string> = {}
) => {
  const attributeKeys = Object.keys(attributes);
  if (attributeKeys.length === 0) return productCode;

  const attributePart = attributeKeys
    .map(
      key =>
        `${key.slice(0, 3).toUpperCase()}-${attributes[key].slice(0, 3).toUpperCase()}`
    )
    .join("-");

  return `${productCode}-${attributePart}`;
};

// Generate variant name from attributes
const generateVariantName = (
  attributes: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  return Object.values(attributes).join(" - ");
};

// Bulk upload CSV processor
const processBulkUpload = (
  csvData: string | ArrayBuffer | null | undefined
) => {
  // Expected CSV format: productCode,variantName,color,size,price,cost,stock,barcode
  if (!csvData || typeof csvData !== "string") return [];
  const lines = csvData.split("\n");
  const headers = lines[0].split(",");

  return lines
    .slice(1)
    .map((line: string) => {
      const values = line.split(",");
      const variant: {
        variantName?: string;
        price?: number;
        cost?: number;
        stockQuantity?: number;
        barcode?: string;
        attributes?: Record<string, string>;
      } = {};

      headers.forEach((header: string, index: number) => {
        const value = values[index]?.trim();
        if (value) {
          switch (header.toLowerCase()) {
            case "variantname":
              variant.variantName = value;
              break;
            case "price":
              variant.price = parseFloat(value);
              break;
            case "cost":
              variant.cost = parseFloat(value);
              break;
            case "stock":
            case "stockquantity":
              variant.stockQuantity = parseInt(value);
              break;
            case "barcode":
              variant.barcode = value;
              break;
            default:
              // Treat other columns as attributes
              if (!variant.attributes) variant.attributes = {};
              variant.attributes[header.toLowerCase()] = value;
          }
        }
      });

      return variant;
    })
    .filter(
      variant => variant.variantName !== undefined && variant.variantName !== ""
    ); // Filter out empty rows
};

// SKU Validation Component
const SkuValidator = ({
  sku,
  allSkus,
  index,
}: {
  sku: string;
  allSkus: string[];
  index: number;
}) => {
  const [isValid, setIsValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!sku) return;

    setIsChecking(true);

    // Check for duplicates in current form
    const otherSkus = allSkus.filter((_: any, i: any) => i !== index);
    const isDuplicate = otherSkus.includes(sku);

    // Simulate API call to check against database
    setTimeout(() => {
      setIsValid(!isDuplicate);
      setIsChecking(false);
    }, 500);
  }, [sku, allSkus, index]);

  if (!sku) return null;

  return (
    <div className='flex items-center mt-1'>
      {isChecking ? (
        <span className='text-xs text-gray-500'>Checking...</span>
      ) : isValid ? (
        <span className='flex items-center text-xs text-green-600'>
          <Check className='w-3 h-3 mr-1' />
          Available
        </span>
      ) : (
        <span className='flex items-center text-xs text-red-600'>
          <X className='w-3 h-3 mr-1' />
          Already exists
        </span>
      )}
    </div>
  );
};

// Bulk Operations Component
type BulkOperationsProps = {
  onBulkUpload: (variants: any[]) => void;
  variants: any[];
  productCode: string;
};

const BulkOperations = ({
  onBulkUpload,
  variants,
  productCode,
}: BulkOperationsProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const csvData = e.target?.result;
          const processedVariants = processBulkUpload(csvData);
          onBulkUpload(processedVariants);
          toast.success(
            `${processedVariants.length} variants uploaded successfully`
          );
        } catch (error) {
          console.log(error);
          toast.error("Error processing CSV file");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  const downloadTemplate = () => {
    const template = `variantName,color,size,price,cost,stockQuantity,barcode
Red Large,Red,Large,8500,4700,30,1234567890123
Blue Medium,Blue,Medium,8000,4500,25,1234567890124
Green Small,Green,Small,8000,4500,20,1234567890125`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productCode}-variants-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportVariants = () => {
    if (variants.length === 0) {
      toast.error("No variants to export");
      return;
    }

    const headers = [
      "variantName",
      "sku",
      "price",
      "cost",
      "stockQuantity",
      "barcode",
    ];
    const attributeKeys = new Set<string>();

    // Collect all unique attribute keys
    variants.forEach((variant: { attributes?: Record<string, string> }) => {
      Object.keys(variant.attributes || {}).forEach(key =>
        attributeKeys.add(key)
      );
    });

    const allHeaders = [...headers, ...Array.from(attributeKeys)];

    const csvContent = [
      allHeaders.join(","),
      ...variants.map(
        (variant: {
          variantName?: string;
          sku?: string;
          price?: number;
          cost?: number;
          stockQuantity?: number;
          barcode?: string;
          attributes?: Record<string, string>;
        }) => {
          const row = [
            variant.variantName || "",
            variant.sku || "",
            variant.price || 0,
            variant.cost || 0,
            variant.stockQuantity || 0,
            variant.barcode || "",
          ];

          // Add attribute values
          attributeKeys.forEach(key => {
            row.push(variant.attributes?.[key] || "");
          });

          return row.join(",");
        }
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productCode}-variants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className='flex flex-wrap gap-2 mb-4'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={downloadTemplate}
        className='flex items-center gap-2'
      >
        <Download className='w-4 h-4' />
        Download Template
      </Button>

      <div className='relative'>
        <input
          type='file'
          accept='.csv'
          onChange={handleFileUpload}
          className='hidden'
          id='bulk-upload'
          disabled={isUploading}
        />
        <label
          htmlFor='bulk-upload'
          className='flex items-center gap-2 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-gray-50'
        >
          <Upload className='w-4 h-4' />
          {isUploading ? "Uploading..." : "Bulk Upload"}
        </label>
      </div>

      {variants.length > 0 && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={exportVariants}
          className='flex items-center gap-2'
        >
          <FileText className='w-4 h-4' />
          Export Variants
        </Button>
      )}
    </div>
  );
};

// Enhanced Variant Attribute Builder
interface VariantAttributeBuilderProps {
  index: number;
  form: any;
  onAttributeChange?: () => void;
  autoGenerateSku: boolean;
  productCode: string;
}

const VariantAttributeBuilder = ({
  index,
  form,
  onAttributeChange,
  autoGenerateSku,
  productCode,
}: VariantAttributeBuilderProps) => {
  const [attributes, setAttributes] = useState(
    form.getValues(`variants.${index}.attributes`) || {}
  );
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addAttribute = () => {
    if (newKey && newValue) {
      const newAttributes = { ...attributes, [newKey]: newValue };
      setAttributes(newAttributes);
      form.setValue(`variants.${index}.attributes`, newAttributes);

      // Auto-generate variant name and SKU
      const variantName = generateVariantName(newAttributes);
      form.setValue(`variants.${index}.name`, variantName);

      if (autoGenerateSku) {
        const sku = generateSku(productCode, newAttributes);
        form.setValue(`variants.${index}.sku`, sku);
      }

      setNewKey("");
      setNewValue("");
      onAttributeChange?.();
    }
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...attributes };
    delete newAttributes[key];
    setAttributes(newAttributes);
    form.setValue(`variants.${index}.attributes`, newAttributes);

    // Update variant name
    const variantName = generateVariantName(newAttributes);
    form.setValue(`variants.${index}.variantName`, variantName);

    if (autoGenerateSku) {
      const sku = generateSku(productCode, newAttributes);
      form.setValue(`variants.${index}.sku`, sku);
    }

    onAttributeChange?.();
  };

  const addQuickAttribute = (attrName: string) => {
    if (!newValue) return;

    const newAttributes = { ...attributes, [attrName]: newValue };
    setAttributes(newAttributes);
    form.setValue(`variants.${index}.attributes`, newAttributes);

    const variantName = generateVariantName(newAttributes);
    form.setValue(`variants.${index}.variantName`, variantName);

    if (autoGenerateSku) {
      const sku = generateSku(productCode, newAttributes);
      form.setValue(`variants.${index}.sku`, sku);
    }

    setNewValue("");
    onAttributeChange?.();
  };

  useEffect(() => {
    const subscription = form.watch(
      (value: { variants: { attributes: any }[] }, { name }: any) => {
        if (
          name?.startsWith(`variants.${index}.attributes`) &&
          autoGenerateSku
        ) {
          const updatedAttributes = value.variants?.[index]?.attributes || {};
          const newSku = generateSku(productCode, updatedAttributes);
          form.setValue(`variants.${index}.sku`, newSku);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [form, index, autoGenerateSku, productCode]);

  return (
    <div className='space-y-2'>
      {/* Quick Add Common Attributes */}
      <div className='flex flex-wrap gap-1 mb-2'>
        {COMMON_VARIANTS.map(attr => (
          <Button
            key={attr}
            type='button'
            variant='outline'
            size='sm'
            className='text-xs'
            onClick={() => addQuickAttribute(attr.toLowerCase())}
            disabled={attributes[attr.toLowerCase()]}
          >
            + {attr}
          </Button>
        ))}
      </div>

      {/* Custom Attribute Input */}
      <div className='flex gap-2'>
        <Select value={newKey} onValueChange={setNewKey}>
          <SelectTrigger className='flex-1'>
            <SelectValue placeholder='Attribute' />
          </SelectTrigger>
          <SelectContent>
            {COMMON_VARIANTS.map(attr => (
              <SelectItem key={attr} value={attr.toLowerCase()}>
                {attr}
              </SelectItem>
            ))}
            <SelectItem value='custom'>Custom...</SelectItem>
          </SelectContent>
        </Select>

        {newKey === "custom" && (
          <Input
            placeholder='Custom attribute'
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            className='flex-1'
          />
        )}

        <Input
          placeholder='Value'
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className='flex-1'
          onKeyPress={e => e.key === "Enter" && addAttribute()}
        />

        <Button
          type='button'
          size='sm'
          onClick={addAttribute}
          disabled={!newKey || !newValue}
        >
          Add
        </Button>
      </div>

      {/* Current Attributes */}
      <div className='flex flex-wrap gap-1'>
        {Object.entries(attributes).map(([key, value]) => (
          <Badge
            key={key}
            variant='secondary'
            className='flex items-center gap-1'
          >
            {String(key)}: {String(value)}
            <button
              type='button'
              onClick={() => removeAttribute(key)}
              className='ml-1 text-red-600 hover:text-red-800'
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [taxTypes, setTaxTypes] = useState<
    { id: string; name: string; rate: number }[]
  >([]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, taxRes] = await Promise.all([
          getProductCategories(),
          getTaxTypes(),
        ]);
        setTaxTypes(taxRes);
        setCategories(catsRes);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load data");
      }
    }

    loadData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      productCode: "",
      productType: "PRODUCT",
      unitOfMeasure: "",
      price: 0,
      cost: 0,
      trackInventory: true,
      reorderLevel: 0,
      maxStockLevel: 0,
      hasVariants: false,
      autoGenerateSku: true,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    replace: replaceVariants,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watchProductType = form.watch("productType");
  const watchTrackInventory = form.watch("trackInventory");
  const watchHasVariants = form.watch("hasVariants");
  const watchAutoGenerateSku = form.watch("autoGenerateSku");
  const watchProductCode = form.watch("productCode");
  const watchBasePrice = form.watch("price");
  const watchBaseCost = form.watch("cost");

  // Auto-generate main product SKU
  // useEffect(() => {
  //   if (watchAutoGenerateSku && watchProductCode && !watchHasVariants) {
  //     form.setValue("sku", watchProductCode);
  //   }
  // }, [watchAutoGenerateSku, watchProductCode, watchHasVariants]);

  useEffect(() => {
    if (watchAutoGenerateSku && watchProductCode) {
      form.setValue("sku", watchProductCode);
    }
  }, [watchAutoGenerateSku, watchProductCode, form]);

  // Get all SKUs for validation
  const allSkus = variantFields.map(field =>
    form.getValues(`variants.${variantFields.indexOf(field)}.sku`)
  );

  const handleBulkUpload = (uploadedVariants: any[]) => {
    const processedVariants = uploadedVariants.map(variant => ({
      name: variant.name ?? generateVariantName(variant.attributes),
      sku: variant.sku || generateSku(watchProductCode, variant.attributes),
      price: Number(variant.price) || watchBasePrice || 0,
      cost: Number(variant.cost) || watchBaseCost || 0,
      stockQuantity: Number(variant.stockQuantity) || 0,
      reservedQuantity: 0,
      attributes: variant.attributes || {},
      barcode: variant.barcode || "",
      isActive: true,
    }));

    replaceVariants(processedVariants);
  };

  const addVariant = () => {
    appendVariant({
      name: "",
      sku: "",
      price: watchBasePrice || 0,
      cost: watchBaseCost || 0,
      stockQuantity: 0,
      reservedQuantity: 0,
      attributes: {},
      barcode: "",
      isActive: true,
    });
  };

  const duplicateVariant = (index: number) => {
    const variant = form.getValues(`variants.${index}`);
    const newVariant = {
      ...variant,
      variantName: `${variant.name} (Copy)`,
      sku: `${variant.sku}-COPY`,
    };
    appendVariant(newVariant);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];

    form.setValue("image", await convertImageToBase64(file as File)); // Save single image

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      const productData = {
        name: values.name,
        description: values.description,
        sku: values.sku,
        productCode: values.productCode,
        productType: values.productType,
        unitOfMeasure: values.unitOfMeasure,
        price: values.price,
        cost: values.cost,
        image: values.image,
        trackInventory: values.trackInventory,
        reorderLevel: values.reorderLevel,
        maxStockLevel: values.maxStockLevel,
        defaultTaxTypeId: values.defaultTaxTypeId,
        categoryId: values.categoryId,
        variants: values.hasVariants ? values.variants : undefined,
      };

      console.log("Submitting enhanced product data:", productData);

      const res = await createProduct(productData);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // await createProduct(productData);
      toast.success("Product created successfully");
      form.reset();
      router.refresh();
      setPreview(null);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Badge variant='outline' className='bg-blue-300 rounded-full'>
                Basic Information
              </Badge>
              <FormField
                control={form.control}
                name='autoGenerateSku'
                render={({ field }) => (
                  <div className='flex items-center gap-2 ml-auto'>
                    <input
                      type='checkbox'
                      checked={field.value}
                      onChange={field.onChange}
                      id='auto-sku'
                    />
                    <label htmlFor='auto-sku' className='text-sm font-normal'>
                      Auto-generate SKUs
                    </label>
                    <Wand2 className='w-4 h-4 text-blue-500' />
                  </div>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., Samsung Galaxy A35'
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='productCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., PROD-001' required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Auto-generated or manual'
                      disabled={watchAutoGenerateSku}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='productType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='PRODUCT'>
                          Physical Product
                        </SelectItem>
                        <SelectItem value='SERVICE'>Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='defaultTaxTypeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        const selectedTax = taxTypes.find(t => t.id === value);
                        if (selectedTax) {
                          form.setValue(`defaultTaxTypeId`, selectedTax.id);
                        }
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select tax' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taxTypes.map(tax => (
                          <SelectItem key={tax.id} value={tax.id}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Badge variant='outline' className='bg-red-300 rounded-full'>
                Pricing & Inventory
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue("price", val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue("cost", val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex items-center justify-between'>
              <FormField
                control={form.control}
                name='trackInventory'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                      <label className='text-sm font-medium'>
                        Track Inventory
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='hasVariants'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                      <label className='text-sm font-medium'>
                        Has Variants (e.g., color, size)
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Inventory Fields */}
            {watchTrackInventory &&
              watchProductType === "PRODUCT" &&
              !watchHasVariants && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='unitOfMeasure'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measure *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select unit' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CAMEROON_UNITS.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='reorderLevel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Level</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            step='1'
                            {...field}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              form.setValue("reorderLevel", val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maxStockLevel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Stock Level</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            step='1'
                            {...field}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              form.setValue("maxStockLevel", val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
          </CardContent>
        </Card>

        {watchHasVariants && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Badge variant='outline' className='bg-orange-300 rounded-full'>
                  Product Variants
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulkOperations
                onBulkUpload={handleBulkUpload}
                variants={variantFields}
                productCode={watchProductCode}
              />

              <div className='space-y-4'>
                {variantFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='border p-4 rounded-lg space-y-4'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                      <FormField
                        control={form.control}
                        name={`variants.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder='Auto-generated' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='Auto-generated'
                                disabled={watchAutoGenerateSku}
                              />
                            </FormControl>
                            <SkuValidator
                              sku={field.value}
                              allSkus={allSkus}
                              index={index}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variants.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (XAF)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variants.${index}.stockQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <VariantAttributeBuilder
                      index={index}
                      form={form}
                      autoGenerateSku={watchAutoGenerateSku as boolean}
                      productCode={watchProductCode}
                    />

                    <VariantImageUploader index={index} form={form} />

                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => duplicateVariant(index)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => removeVariant(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type='button' variant='outline' onClick={addVariant}>
                  + Add Variant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Badge variant='outline' className='rounded-full'>
                Product Image
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-md'>
              {preview ? (
                <Image
                  width={100}
                  height={100}
                  src={preview}
                  alt='Product Preview'
                  className='h-40 w-auto object-contain mb-4'
                />
              ) : (
                <span className='text-sm text-muted-foreground'>
                  No image uploaded
                </span>
              )}
              <div className='flex flex-col gap-2'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='hidden'
                  id='imageUpload'
                />

                <label
                  htmlFor='imageUpload'
                  className='cursor-pointer mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'
                >
                  {preview ? "Change Image" : "Upload Image"}
                </label>
                {preview && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='text-red-500 border-red-500 hover:bg-red-100 text-sm'
                    onClick={() => {
                      setPreview(null);
                      form.setValue("image", ""); // Optional: Clear from form data
                    }}
                  >
                    Remove Image
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Submit */}

        <div className='flex justify-end'>
          <Button type='submit' disabled={loading}>
            {loading ? <span>Creating...</span> : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
