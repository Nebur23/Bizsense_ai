export const TransactionType = [
  "SALE", // Product or service sold
  "PURCHASE", // Product or inventory purchase
  "EXPENSE", // Operational expense (rent, salaries)
  "REFUND", // Customer refund
  "TRANSFER", // Account transfer
  "LOAN_DISBURSEMENT", // Loan amount received
  "LOAN_REPAYMENT", // Loan repayment
  "SUBSCRIPTION_PAYMENT", // Platform or 3rd party subscription
  "INVESTMENT_INFLOW", // Investment received
  "INVESTMENT_OUTFLOW", // Investment made elsewhere
  "TAX_PAYMENT", // Payment to government
  "SALARY_PAYMENT", // Employee payment
  "COMMISSION", // Paid or earned
  "DONATION", // Money donated or received
  "GRANT_RECEIPT", // Received government/NGO grant
  "UTILITY_PAYMENT", // Electricity, water, internet, etc.
  "MAINTENANCE_EXPENSE", // Equipment/service maintenance
  "INSURANCE_PAYMENT", // For assets, business insurance
  "REIMBURSEMENT", // Refund to employees or others
  "PENALTY_OR_FINE", // Government or legal penalty
  "DEPRECIATION", // Periodic asset depreciation (non-cash)

  "RAW_MATERIAL_PURCHASE", // FOOD_PROCESSING, HANDMADE_GOODS
  "PACKAGING_PURCHASE", // FOOD_PROCESSING, AGRO_PROCESSING
  "TOOL_PURCHASE", // HANDMADE_GOODS
  "WORKSHOP_RENT", // HANDMADE_GOODS
  "STORE_RENT", // GENERAL_RETAIL
  "MARKET_FEES", // HANDMADE_GOODS
  "INVENTORY_RESTOCK", // GENERAL_RETAIL
  "STORAGE_EXPENSE", // AGRO_PROCESSING
  "TRANSPORTATION_EXPENSE", // All
  "EQUIPMENT_PURCHASE", // AGRO_PROCESSING
  "EQUIPMENT_MAINTENANCE", // AGRO_PROCESSING, FOOD_PROCESSING
  "BUSINESS_SUPPLIES", // OTHER
  "STAFF_BONUS", // GENERAL_RETAIL
  "TRAINING_EXPENSE", // OTHER
  "NGO_GRANT_RECEIPT", // GRANT_RECEIPT alternative
  "PRODUCT_RETURN", // Refund from vendor side
  "CREDIT_SALE", // SALE but deferred cash
  "INSTALLMENT_PAYMENT", // Partial payment toward sale
] as const;
