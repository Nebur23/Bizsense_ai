import {  User, Account, FinancialAccount } from "@prisma/client";

declare type Business = {
  name: string;
  type: $Enums.BusinessType;
  id: string;
};

declare type User = User;

declare type Account = FinancialAccount;

declare type CreateAccount = Pick<
  Account,
  | "name"
  | "type"
  | "provider"
  | "accountNumber"
  | "balance"
  | "currency"
  | "isDefault"
>;

declare type AccountTransaction = {
  id?: string;
  accountId: string;
  transactionId?: string;
  amount: number;
  isTransferSource: boolean;
  isTransferDestination: boolean;
};

declare type ProductTransactionItem = {
  id?: string;
  quantity: number;
  priceAtTime: number;
  productId: string;
  transactionId: string;
};

declare type Transaction = {
  id?: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  date: Date | string;
  receiptUrl?: string | null;
  categoryId?: string | null;
  businessId?: string;
  customerId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  productItems?: ProductTransactionItem[] | null;
  accountTransactions?: AccountTransaction[] | null;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
    description: string;
    businessId?: string;
  } | null;
};

declare type CreateTransaction = Pick<
  Transaction,
  | "type"
  | "amount"
  | "description"
  | "categoryId"
  | "receiptUrl"
  | "businessId"
  | "customerId"
  | "productItems"
>;

declare type AccountTransactions = {
  id: string;
  name: string;
  businessId: string;
  type: $Enums.AccountType;
  provider: string | null;
  accountNumber: string | null;
  balance: number;
  currency: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  transactions: {
    id: string;
    accountId: string;
    transactionId: string;
    amount: number;
    isTransferSource: boolean;
    isTransferDestination: boolean;
    createdAt: Date;
    transaction: Transaction;
  }[];
  _count: {
    transactions: number;
  };
};

declare type Category = {
  id: string;
  name: string;
  type: $Enums.CategoryType;
  description: string;
};

declare interface HeaderBoxProps {
  type?: "title" | "greeting";
  title: string;
  subtext: string;
  user?: string;
}

declare interface DoughnutChartProps {
  accounts: Account[];
}

// ====== TYPES & INTERFACES ======
// types/inventory.ts
export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string;
  sku: string;
  price: number;
  cost: number;
  stockQuantity: number;
  attributes: Record<string, string>; // color, size, etc.
  barcode?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER" | "WASTE" | "RETURN";
  quantity: number;
  reference?: string;
  reason?: string;
  userId: string;
  createdAt: Date;
}

export interface StockAlert {
  id: string;
  productId: string;
  type: "LOW_STOCK" | "EXPIRY" | "OVERSTOCK";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface PhysicalCount {
  id: string;
  countNumber: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  startDate: Date;
  completedDate?: Date;
  items: PhysicalCountItem[];
}

export interface PhysicalCountItem {
  id: string;
  countId: string;
  productId: string;
  variantId?: string;
  expectedQuantity: number;
  actualQuantity?: number;
  variance?: number;
  notes?: string;
}
