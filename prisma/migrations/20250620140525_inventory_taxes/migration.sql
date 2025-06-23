/*
  Warnings:

  - You are about to drop the column `taxCategory` on the `products` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "description" TEXT,
    "parentCategoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultTaxTypeId" TEXT,
    CONSTRAINT "product_categories_defaultTaxTypeId_fkey" FOREIGN KEY ("defaultTaxTypeId") REFERENCES "tax_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product_categories" ("businessId", "categoryName", "createdAt", "description", "id", "isActive", "isDeleted", "parentCategoryId") SELECT "businessId", "categoryName", "createdAt", "description", "id", "isActive", "isDeleted", "parentCategoryId" FROM "product_categories";
DROP TABLE "product_categories";
ALTER TABLE "new_product_categories" RENAME TO "product_categories";
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "cost" REAL,
    "stockQuantity" INTEGER,
    "sku" TEXT,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT,
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
INSERT INTO "new_products" ("businessId", "categoryId", "cost", "costPrice", "createdAt", "description", "id", "isActive", "isDeleted", "maxStockLevel", "name", "price", "productCode", "productType", "reorderLevel", "sellingPrice", "sku", "stockQuantity", "trackInventory", "unitOfMeasure", "updatedAt") SELECT "businessId", "categoryId", "cost", "costPrice", "createdAt", "description", "id", "isActive", "isDeleted", "maxStockLevel", "name", "price", "productCode", "productType", "reorderLevel", "sellingPrice", "sku", "stockQuantity", "trackInventory", "unitOfMeasure", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_businessId_productCode_key" ON "products"("businessId", "productCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
