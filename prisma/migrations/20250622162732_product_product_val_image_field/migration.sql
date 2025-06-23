/*
  Warnings:

  - You are about to drop the column `value` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_ProductVariantToSalesOrderItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductVariantToSalesOrderItem_A_fkey" FOREIGN KEY ("A") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductVariantToSalesOrderItem_B_fkey" FOREIGN KEY ("B") REFERENCES "sales_order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProductVariantToPurchaseOrderItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductVariantToPurchaseOrderItem_A_fkey" FOREIGN KEY ("A") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductVariantToPurchaseOrderItem_B_fkey" FOREIGN KEY ("B") REFERENCES "purchase_order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_InvoiceItemToProductVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InvoiceItemToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "invoice_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InvoiceItemToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "image" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_variants" ("attributes", "barcode", "cost", "createdAt", "id", "isActive", "price", "productId", "sku", "stockQuantity", "updatedAt", "variantName") SELECT "attributes", "barcode", "cost", "createdAt", "id", "isActive", "price", "productId", "sku", "stockQuantity", "updatedAt", "variantName" FROM "product_variants";
DROP TABLE "product_variants";
ALTER TABLE "new_product_variants" RENAME TO "product_variants";
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stockQuantity" INTEGER,
    "sku" TEXT,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT,
    "image" TEXT,
    "productCode" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "costPrice" REAL DEFAULT 0,
    "sellingPrice" REAL DEFAULT 0,
    "unitOfMeasure" TEXT,
    "reorderLevel" REAL DEFAULT 0,
    "maxStockLevel" REAL DEFAULT 0,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "defaultTaxTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_defaultTaxTypeId_fkey" FOREIGN KEY ("defaultTaxTypeId") REFERENCES "tax_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("businessId", "categoryId", "costPrice", "createdAt", "defaultTaxTypeId", "description", "id", "isActive", "isDeleted", "maxStockLevel", "name", "productCode", "productType", "reorderLevel", "sellingPrice", "sku", "stockQuantity", "trackInventory", "unitOfMeasure", "updatedAt") SELECT "businessId", "categoryId", "costPrice", "createdAt", "defaultTaxTypeId", "description", "id", "isActive", "isDeleted", "maxStockLevel", "name", "productCode", "productType", "reorderLevel", "sellingPrice", "sku", "stockQuantity", "trackInventory", "unitOfMeasure", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_businessId_productCode_key" ON "products"("businessId", "productCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToSalesOrderItem_AB_unique" ON "_ProductVariantToSalesOrderItem"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToSalesOrderItem_B_index" ON "_ProductVariantToSalesOrderItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToPurchaseOrderItem_AB_unique" ON "_ProductVariantToPurchaseOrderItem"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToPurchaseOrderItem_B_index" ON "_ProductVariantToPurchaseOrderItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_InvoiceItemToProductVariant_AB_unique" ON "_InvoiceItemToProductVariant"("A", "B");

-- CreateIndex
CREATE INDEX "_InvoiceItemToProductVariant_B_index" ON "_InvoiceItemToProductVariant"("B");
