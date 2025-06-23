"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getUserAccounts } from "@/actions/accounts/get";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/category/get";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createTransaction } from "@/actions/transactions/create";
import { TransactionType } from "@/data/transaction-type";
import { ReceiptScanner } from "./(components)/recipt-scanner";
import { Transaction } from "@/types";

// Define the types
type Account = {
  id: string;
  name: string;
  balance: number;
  type: string;
};

type Category = {
  id: string;
  name: string;
  type: string;
  description: string;
};

type AccountTransaction = {
  accountId: string;
  amount: number;
  isTransferSource: boolean;
  isTransferDestination: boolean;
};

// Main form schema structure
type FormValues = {
  type: string;
  amount: number;
  description?: string;
  date: Date;
  categoryId?: string;
  accountTransactions?: AccountTransaction[];
  fromAccountId?: string;
  toAccountId?: string;
  customerId?: string;
};

// Mapping transaction types to category types
export const transactionToCategoryTypeMap: Record<
  string,
  "INCOME" | "EXPENSE" | "TRANSFER"
> = {
  SALE: "INCOME", // Product or service sold
  PURCHASE: "EXPENSE", // Product or inventory purchase
  EXPENSE: "EXPENSE", // Operational expense (rent, salaries)
  REFUND: "INCOME", // Customer refund

  TRANSFER: "TRANSFER", // Internal movement  // Account transfer

  LOAN_DISBURSEMENT: "INCOME", // Money received // Loan amount received
  LOAN_REPAYMENT: "EXPENSE", // Money paid out

  SUBSCRIPTION_PAYMENT: "EXPENSE",
  INVESTMENT_INFLOW: "INCOME",
  INVESTMENT_OUTFLOW: "EXPENSE",
  TAX_PAYMENT: "EXPENSE",
  SALARY_PAYMENT: "EXPENSE",
  COMMISSION: "EXPENSE",
  DONATION: "INCOME", // Can be income or expense depending on context, here assumed received
  GRANT_RECEIPT: "INCOME",
  UTILITY_PAYMENT: "EXPENSE", // Electricity, water, internet, etc.
  MAINTENANCE_EXPENSE: "EXPENSE", // Equipment/service maintenance
  INSURANCE_PAYMENT: "EXPENSE", // For assets, business insurance
  REIMBURSEMENT: "EXPENSE", // Refunds paid out
  PENALTY_OR_FINE: "EXPENSE",
  DEPRECIATION: "EXPENSE", // Non-cash but still recorded as expense
};

export default function AddTransactionForm() {
  const [isTransfer, setIsTransfer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize form
  const form = useForm<FormValues>({
    defaultValues: {
      type: "",
      date: new Date(),
      amount: 0,
      description: "",
      accountTransactions: [
        {
          accountId: "",
          amount: 0,
          isTransferSource: false,
          isTransferDestination: false,
        },
      ],
      fromAccountId: "",
      toAccountId: "",
      customerId: "",
    },
    mode: "onChange",
  });

  // Setup field array for dynamic account transactions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "accountTransactions",
  });

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: getUserAccounts,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryFn: getCategories,
    queryKey: ["categories"],
  });

  // Store the current transaction type to watch for changes
  const transactionType = form.watch("type");
  const fromAccountId = form.watch("fromAccountId");
  const toAccountId = form.watch("toAccountId");

  // IMPROVED: Use useWatch to watch all account transactions for any changes
  // This will trigger whenever any account or amount changes in any row
  const accountTransactions = useWatch({
    control: form.control,
    name: "accountTransactions",
    defaultValue: [],
  });

  // Handle switching between transfer and regular transaction
  useEffect(() => {
    setIsTransfer(transactionType === "TRANSFER");

    // Reset form fields when switching transaction types
    if (transactionType === "TRANSFER") {
      form.setValue("categoryId", "");
      // Clear account transactions array for transfers
      form.setValue("accountTransactions", []);
    } else if (transactionType) {
      form.setValue("fromAccountId", "");
      form.setValue("toAccountId", "");

      // Ensure we have at least one account transaction for non-transfer types
      if (!accountTransactions || accountTransactions.length === 0) {
        form.setValue("accountTransactions", [
          {
            accountId: "",
            amount: 0,
            isTransferSource: false,
            isTransferDestination: false,
          },
        ]);
      }
    }
  }, [transactionType, form, accountTransactions]);

  // FIXED: More reliable update for total amount when individual account amounts change
  useEffect(() => {
    // Skip if we're in transfer mode or don't have any transactions to calculate
    if (
      isTransfer ||
      !accountTransactions ||
      accountTransactions.length === 0
    ) {
      return;
    }

    // Calculate the sum of all account transaction amounts
    const calculatedTotal = accountTransactions.reduce((sum, transaction) => {
      // Handle both string and number types safely
      const transactionAmount =
        typeof transaction.amount === "string"
          ? parseFloat(transaction.amount || "0")
          : transaction.amount || 0;

      return sum + transactionAmount;
    }, 0);

    // Format to 2 decimal places for consistency
    const formattedTotal = parseFloat(calculatedTotal.toFixed(2));

    // Update the total amount in the form
    form.setValue("amount", formattedTotal);
  }, [accountTransactions, isTransfer, form]);

  // Reset the categoryId when transaction type changes (for non-transfer types)
  useEffect(() => {
    if (transactionType && transactionType !== "TRANSFER") {
      form.setValue("categoryId", "");
    }
  }, [transactionType, form]);

  // Get filtered categories based on current transaction type's corresponding category type
  const filteredCategories =
    categories?.filter(category => {
      if (!transactionType || transactionType === "TRANSFER") return false;

      // Get the category type that corresponds to the current transaction type
      const mappedCategoryType = transactionToCategoryTypeMap[transactionType];

      // Filter categories by the mapped category type
      return category.type === mappedCategoryType;
    }) || [];

  // Check if an account is already selected in another field
  const isAccountSelected = (accountId: string, currentIndex: number) => {
    return accountTransactions?.some(
      (item, index) => item.accountId === accountId && index !== currentIndex
    );
  };

  // Function to add a new account to the form
  const addNewAccount = () => {
    append({
      accountId: "",
      amount: 0,
      isTransferSource: false,
      isTransferDestination: false,
    });
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Transaction) => {
      return createTransaction(data);
    },
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ["transactions, accounts"] });
      // Vérification stricte du statusCode
      if (response.statusCode === 201) {
        toast.success(response.message);
        router.push(
          `/dashboard/${response.data?.businessId}/Finance/my-accounts`
        );
        router.refresh();
      } else {
        toast.error(response.message);
      }
    },

    onError: () => {
      toast.error("Erreur durant la création du patient");
    },
  });

  // Prepare data for submission with client-side validation
  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      // Basic validation
      if (!values.type) {
        toast.error("Transaction type is required");
        return;
      }

      // Form data that will be sent to the server
      const submissionData: Transaction = {
        type: values.type,
        amount: values.amount,
        description: values.description || "",
        date: values.date,
        categoryId: values.type !== "TRANSFER" ? values.categoryId : null,
        customerId: values.customerId || null,
        accountTransactions: [],
      };

      if (values.type === "TRANSFER") {
        if (!values.fromAccountId) {
          toast.error("Source account is required");
          return;
        }
        if (!values.toAccountId) {
          toast.error("Destination account is required");
          return;
        }
        if (values.fromAccountId === values.toAccountId) {
          toast.error("Source and destination accounts must be different");
          return;
        }
        if (!values.amount || values.amount <= 0) {
          toast.error("Transfer amount must be greater than 0");
          return;
        }

        // For transfers, set up source and destination account transactions
        submissionData.accountTransactions = [
          {
            accountId: values.fromAccountId,
            amount: values.amount,
            isTransferSource: true,
            isTransferDestination: false,
          },
          {
            accountId: values.toAccountId,
            amount: values.amount,
            isTransferSource: false,
            isTransferDestination: true,
          },
        ];
      } else {
        if (
          !values.accountTransactions ||
          values.accountTransactions.length === 0
        ) {
          toast.error("At least one account must be selected");
          return;
        }

        // Verify all account transactions have valid accounts and amounts
        const invalidTransactions = values.accountTransactions.filter(
          tx => !tx.accountId || !tx.amount || tx.amount <= 0
        );

        if (invalidTransactions.length > 0) {
          toast.error(
            "All accounts must have a valid account and amount greater than 0"
          );
          return;
        }

        if (
          !values.categoryId &&
          ["SALE", "EXPENSE", "PURCHASE", "REFUND"].includes(values.type)
        ) {
          toast.error("Category is required for this transaction type");
          return;
        }

        submissionData.accountTransactions = values.accountTransactions;
      }

      toast(
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>
            {JSON.stringify(submissionData, null, 2)}
          </code>
        </pre>
      );

      createMutation.mutate(submissionData);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingAccounts || isLoadingCategories) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-2'>Loading...</span>
      </div>
    );
  }

  // Update the handleScanComplete function to properly map scanned data to form fields
  const handleScanComplete = (data: {
    amount: number;
    date: Date;
    description: string;
    category: string;
    merchantName: string;
    transactionType: string;
  }) => {
    // Set transaction type first to trigger UI updates
    form.setValue("type", data.transactionType || "EXPENSE");

    // Small delay to ensure the form has updated its UI based on transaction type
    setTimeout(() => {
      // Set basic transaction details
      form.setValue("date", new Date(data.date));
      form.setValue(
        "description",
        data.description || `Purchase at ${data.merchantName}`
      );

      // Only set category after transaction type has been set to ensure filtered categories are available
      if (data.category && categories) {
        // Find a matching category by name or partial match
        const matchingCategory = categories.find(
          cat =>
            cat.name.toLowerCase().includes(data.category.toLowerCase()) ||
            data.category.toLowerCase().includes(cat.name.toLowerCase())
        );

        if (matchingCategory) {
          form.setValue("categoryId", matchingCategory.id);
        }
      }

      // Handle account transactions - set the amount in the first account slot
      if (form.getValues("type") !== "TRANSFER") {
        // Update all account transactions first item amount
        if (
          form.getValues("accountTransactions") &&
          (form.getValues("accountTransactions") || []).length > 0
        ) {
          form.setValue("accountTransactions.0.amount", data.amount);
        } else {
          // If no account transactions exist, create one
          form.setValue("accountTransactions", [
            {
              accountId: "",
              amount: data.amount,
              isTransferSource: false,
              isTransferDestination: false,
            },
          ]);
        }

        // Update the total amount field (though it should update automatically via the useEffect)
        form.setValue("amount", data.amount);
      } else {
        // For transfers, set the transfer amount directly
        form.setValue("amount", data.amount);
      }
    }, 100); // Small delay to ensure transaction type change has propagated
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 max-w-3xl mx-auto py-10'
      >
        <ReceiptScanner onScanComplete={handleScanComplete} />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={value => {
                  field.onChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TransactionType.map(type => (
                    <SelectItem key={type} value={type}>
                      {type
                        .toLowerCase()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, char => char.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isTransfer ? (
          // Transfer-specific fields
          <>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='fromAccountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select source account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.map(account => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            disabled={account.id === toAccountId}
                          >
                            {account.name} ({formatCurrency(account.balance)})
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
                name='toAccountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select destination account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.map(account => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            disabled={account.id === fromAccountId}
                          >
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fromAccountId && toAccountId && (
              <div className='flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-md'>
                <div className='text-sm font-medium'>
                  {accounts?.find(a => a.id === fromAccountId)?.name ||
                    "Source"}
                </div>
                <ArrowRight className='h-4 w-4 text-gray-500' />
                <div className='text-sm font-medium'>
                  {accounts?.find(a => a.id === toAccountId)?.name ||
                    "Destination"}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='0.00'
                      type='number'
                      value={field.value || ""}
                      onChange={e =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      step='0.01'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          // Regular transaction fields
          <>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='0.00'
                      type='number'
                      value={field.value || ""}
                      disabled
                      className='bg-gray-100'
                    />
                  </FormControl>
                  <FormDescription>
                    Total from all accounts (automatically calculated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType && transactionType !== "TRANSFER" && (
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name} ({cat.description})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value='no-categories' disabled>
                            {transactionType
                              ? "No categories for this type"
                              : "Select a type first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {transactionType && transactionType !== "TRANSFER" && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>Account Allocations</h3>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addNewAccount}
                    disabled={!accounts || fields.length >= accounts.length}
                  >
                    <Plus className='h-4 w-4 mr-2' /> Add Account
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className='rounded-md border'>
                    <CardContent className='pt-4'>
                      <div className='grid gap-4 md:grid-cols-2 items-end'>
                        <FormField
                          control={form.control}
                          name={`accountTransactions.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select account' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts?.map(account => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id}
                                      disabled={isAccountSelected(
                                        account.id,
                                        index
                                      )}
                                    >
                                      {account.name} (
                                      {formatCurrency(account.balance)})
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
                          name={`accountTransactions.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <div className='flex items-center gap-2'>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='0.00'
                                    value={field.value || ""}
                                    onChange={e => {
                                      // Directly update the field value
                                      const newValue =
                                        parseFloat(e.target.value) || 0;
                                      field.onChange(newValue);
                                    }}
                                    step='0.01'
                                  />
                                </FormControl>
                                {fields.length > 1 && (
                                  <Button
                                    type='button'
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder='Enter description' type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={!transactionType || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...
            </>
          ) : isTransfer ? (
            "Complete Transfer"
          ) : (
            "Submit Transaction"
          )}
        </Button>
      </form>
    </Form>
  );
}
