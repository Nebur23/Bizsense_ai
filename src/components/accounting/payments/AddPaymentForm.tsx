/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  applyPaymentToInvoice,
  getInvoicesForCustomer,
} from "@/actions/accounting/invoices";
import {
  createPayment,
} from "@/actions/accounting/payments";
import { getMobileMoneyAccounts } from "../mobile-money.actions";
import { getCustomers } from "@/actions/accounting/customers";
import { getSuppliers } from "@/actions/accounting/suppliers";
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  Receipt,
  ArrowUpDown,
  Check,
} from "lucide-react";

// Cameroon Payment Methods Configuration
const CAMEROON_PAYMENT_METHODS = {
  CASH: {
    id: "CASH",
    name: "Espèces / Cash",
    icon: Banknote,
    description: "Paiement en espèces",
    color: "bg-green-500",
  },
  CHEQUE: {
    id: "CHEQUE",
    name: "Chèque",
    icon: Receipt,
    description: "Chèque bancaire",
    color: "bg-blue-500",
  },
  BANK_TRANSFER: {
    id: "BANK_TRANSFER",
    name: "Virement Bancaire",
    icon: Building2,
    description: "Virement bancaire",
    color: "bg-purple-500",
  },
  MOBILE_MONEY: {
    id: "MOBILE_MONEY",
    name: "Mobile Money",
    icon: Smartphone,
    description: "Paiement mobile",
    color: "bg-orange-500",
  },
};

// Cameroon Banks
const CAMEROON_BANKS = [
  { id: "CCA", name: "Crédit Communautaire d'Afrique (CCA)", code: "CCA" },
  { id: "UBA", name: "United Bank for Africa (UBA)", code: "UBA" },
  { id: "AFRILAND", name: "Afriland First Bank", code: "AFRILAND" },
  {
    id: "BICEC",
    name: "Banque Internationale du Cameroun (BICEC)",
    code: "BICEC",
  },
  { id: "SGBC", name: "Société Générale Banque Cameroun", code: "SGBC" },
  { id: "ECOBANK", name: "Ecobank Cameroun", code: "ECOBANK" },
  { id: "COMMERCIAL_BANK", name: "Commercial Bank of Cameroon", code: "CBC" },
  { id: "STANDARD_CHARTERED", name: "Standard Chartered Bank", code: "SCB" },
  { id: "NFC_BANK", name: "NFC Bank", code: "NFC" },
  { id: "UNION_BANK", name: "Union Bank of Cameroon", code: "UBC" },
];

// Mobile Money Providers
const MOBILE_MONEY_PROVIDERS = [
  { id: "ORANGE", name: "Orange Money", code: "OM", color: "bg-orange-500" },
  { id: "MTN", name: "MTN Mobile Money", code: "MOMO", color: "bg-yellow-500" },
  { id: "CAMTEL", name: "Camtel Money", code: "CM", color: "bg-blue-500" },
  { id: "NEXTTEL", name: "Nexttel Possa", code: "POSSA", color: "bg-red-500" },
  { id: "YUP", name: "YUP", code: "YUP", color: "bg-green-500" },
];

// Enhanced Validation Schema
const paymentSchema = z
  .object({
    paymentType: z.enum(["Receipt", "Payment"], {
      required_error: "Type de paiement requis",
    }),
    paymentMethod: z.string().min(1, "Méthode de paiement requise"),
    customerId: z.string().optional(),
    supplierId: z.string().optional(),
    invoiceId: z.string().optional(),
    amount: z.number().min(0.01, "Le montant doit être supérieur à zéro"),
    reference: z.string().optional(),
    notes: z.string().optional(),
    accountId: z.string().optional(),
    bankId: z.string().optional(),
    mobileProvider: z.string().optional(),
    chequeNumber: z.string().optional(),
    chequeDate: z.string().optional(),
    bankAccount: z.string().optional(),
    mobileNumber: z.string().optional(),
  })
  .refine(
    data => {
      // Validate mobile money fields
      if (data.paymentMethod === "MOBILE_MONEY") {
        return data.mobileProvider && data.mobileNumber;
      }
      // Validate bank transfer fields
      if (data.paymentMethod === "BANK_TRANSFER") {
        return data.bankId && data.bankAccount;
      }
      // Validate cheque fields
      if (data.paymentMethod === "CHEQUE") {
        return data.chequeNumber && data.chequeDate && data.bankId;
      }
      return true;
    },
    {
      message:
        "Veuillez remplir tous les champs requis pour cette méthode de paiement",
    }
  );

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
  onSuccess?: () => void;
}

export function AddPaymentForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [mobileMoneyAccounts, setMobileMoneyAccounts] = useState<
    {
      id: string;
      isDeleted: boolean;
      createdAt: Date;
      businessId: string;
      balance: number;
      isActive: boolean;
      provider: string;
      accountNumber: string;
      accountName: string;
    }[]
  >([]);
  console.log(mobileMoneyAccounts);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "Receipt",
      paymentMethod: "CASH",
      amount: 0,
      reference: "",
      notes: "",
    },
  });

  const paymentType = form.watch("paymentType");
  const customerId = form.watch("customerId");
  const paymentMethod = form.watch("paymentMethod");
  const amount = form.watch("amount");
  const selectedInvoice = form.watch("invoiceId");

  // Load customers and suppliers
  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, suppRes] = await Promise.all([
          getCustomers(),
          getSuppliers(),
        ]);
        setCustomers(custRes);
        setSuppliers(suppRes);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Échec du chargement des données");
      }
    }
    loadData();
  }, []);

  // Load invoices when customer changes
  useEffect(() => {
    if (paymentType === "Receipt" && customerId) {
      async function loadCustomerInvoices(id: string) {
        try {
          const res = await getInvoicesForCustomer(id);
          setInvoices(res);
        } catch (error) {
          console.error("Error loading invoices:", error);
          toast.error("Échec du chargement des factures");
        }
      }
      loadCustomerInvoices(customerId);
    } else {
      setInvoices([]);
    }
  }, [paymentType, customerId]);

  // Load mobile money accounts
  useEffect(() => {
    async function loadMobileMoneyAccounts() {
      if (paymentMethod === "MOBILE_MONEY") {
        try {
          const res = await getMobileMoneyAccounts();
          setMobileMoneyAccounts(res);
        } catch (error) {
          console.error("Failed to load mobile money accounts:", error);
          toast.error("Échec du chargement des comptes mobile money");
        }
      }
    }
    loadMobileMoneyAccounts();
  }, [paymentMethod]);

  // Auto-fill amount when invoice is selected
  useEffect(() => {
    if (selectedInvoice && invoices.length > 0) {
      const invoice = invoices.find(inv => inv.id === selectedInvoice);
      if (invoice) {
        form.setValue("amount", invoice.balance);
      }
    }
  }, [selectedInvoice, invoices, form]);

  async function onSubmit(values: PaymentFormData) {
    setLoading(true);
    try {
      const res = await createPayment(values);
      if (!res.success) {
        throw new Error(res.message || "Échec de la création du paiement");
      }

      if (values.invoiceId) {
        await applyPaymentToInvoice(values.invoiceId, values.amount);
      }

      toast.success(res.message || "Paiement enregistré avec succès");
      form.reset({
        paymentType: "Receipt",
        paymentMethod: "CASH",
        amount: 0,
        reference: "",
        notes: "",
        customerId: "",
        invoiceId: "",
      });
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de l'enregistrement du paiement"
      );
    } finally {
      setLoading(false);
    }
  }

  const renderPaymentMethodCard = (method: any) => {
    const Icon = method.icon;
    const isSelected = paymentMethod === method.id;

    return (
      <Card
        key={method.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? "ring-2 ring-primary border-primary" : ""
        }`}
        onClick={() => form.setValue("paymentMethod", method.id)}
      >
        <CardContent className='p-4'>
          <div className='flex items-center space-x-3'>
            <div className={`p-2 rounded-lg ${method.color} text-white`}>
              <Icon size={20} />
            </div>
            <div className='flex-1'>
              <h3 className='font-medium'>{method.name}</h3>
              <p className='text-sm text-muted-foreground'>
                {method.description}
              </p>
            </div>
            {isSelected && <Check className='text-primary' size={20} />}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ArrowUpDown className='h-5 w-5' />
            New Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Payment Type */}
              <FormField
                control={form.control}
                name='paymentType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
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
                        <SelectItem value='Receipt'>
                          <div className='flex items-center gap-2'>
                            <Receipt size={16} />
                            Customer Receipt
                          </div>
                        </SelectItem>
                        <SelectItem value='Payment'>
                          <div className='flex items-center gap-2'>
                            <ArrowUpDown size={16} />
                            Supplier Payment
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method Selection */}
              <FormField
                control={form.control}
                name='paymentMethod'
                render={() => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {Object.values(CAMEROON_PAYMENT_METHODS).map(
                        renderPaymentMethodCard
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method Specific Fields */}
              {paymentMethod === "MOBILE_MONEY" && (
                <Card className='bg-orange-50 border-orange-200'>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Smartphone className='h-5 w-5' />
                      Mobile Money Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='mobileProvider'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opérateur Mobile</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'opérateur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MOBILE_MONEY_PROVIDERS.map(provider => (
                                <SelectItem
                                  key={provider.id}
                                  value={provider.id}
                                >
                                  <div className='flex items-center gap-2'>
                                    <Badge className={provider.color}>
                                      {provider.code}
                                    </Badge>
                                    {provider.name}
                                  </div>
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
                      name='mobileNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de Téléphone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Ex: 237 6XX XXX XXX'
                              type='tel'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "BANK_TRANSFER" && (
                <Card className='bg-blue-50 border-blue-200'>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Building2 className='h-5 w-5' />
                      Bank Transfer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='bankId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banque</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Sélectionner la banque' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CAMEROON_BANKS.map(bank => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  <div className='flex items-center gap-2'>
                                    <Badge variant='outline'>{bank.code}</Badge>
                                    {bank.name}
                                  </div>
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
                      name='bankAccount'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de Compte</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Ex: 10001-00001-12345678901-23'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "CHEQUE" && (
                <Card className='bg-purple-50 border-purple-200'>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <CreditCard className='h-5 w-5' />
                      Détails Chèque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='bankId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banque Émettrice</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Sélectionner la banque' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CAMEROON_BANKS.map(bank => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  <div className='flex items-center gap-2'>
                                    <Badge variant='outline'>{bank.code}</Badge>
                                    {bank.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='chequeNumber'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro du Chèque</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='Ex: 0000123456'
                                className='font-mono'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='chequeDate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date du Chèque</FormLabel>
                            <FormControl>
                              <Input {...field} type='date' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Customer or Supplier Selection */}
              {paymentType === "Receipt" ? (
                <FormField
                  control={form.control}
                  name='customerId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Customer' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(cust => (
                            <SelectItem key={cust.id} value={cust.id}>
                              <div className='flex items-center gap-2'>
                                <Badge variant='secondary'>
                                  {cust.customerCode}
                                </Badge>
                                {cust.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name='supplierId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseur</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Supplier' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map(supp => (
                            <SelectItem key={supp.id} value={supp.id}>
                              <div className='flex items-center gap-2'>
                                <Badge variant='secondary'>
                                  {supp.supplierCode}
                                </Badge>
                                {supp.supplierName}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Invoice Selection */}
              {paymentType === "Receipt" && invoices.length > 0 && (
                <FormField
                  control={form.control}
                  name='invoiceId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice to Pay</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Sélectionner la facture (optionnel)' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {invoices.map(inv => (
                            <SelectItem key={inv.id} value={inv.id}>
                              <div className='flex items-center justify-between w-full'>
                                <div>
                                  <div className='font-medium'>
                                    {inv.invoiceNumber}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    Due Date:{" "}
                                    {format(
                                      new Date(inv.dueDate),
                                      "dd/MM/yyyy"
                                    )}
                                  </div>
                                </div>
                                <Badge variant='outline'>
                                  {formatCurrency(inv.balance)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an invoice to automatically apply the payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Amount */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        {...field}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          form.setValue("amount", val);
                        }}
                        className='text-lg font-semibold'
                      />
                    </FormControl>
                    <FormDescription>
                      Amount in CFA Francs (XAF)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference */}
              <FormField
                control={form.control}
                name='reference'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference / Transaction ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Ex: TXN123456789, REF-2024-001'
                        className='font-mono'
                      />
                    </FormControl>
                    <FormDescription>
                      Unique reference for this payment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder='Informations additionnelles sur ce paiement...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className='flex justify-end space-x-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='min-w-[150px]'
                >
                  {loading ? "Saving..." : "Save Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {amount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Amount:</span>
                <span className='font-semibold text-lg'>
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Method:</span>
                <span>
                  {
                    CAMEROON_PAYMENT_METHODS[
                      paymentMethod as keyof typeof CAMEROON_PAYMENT_METHODS
                    ]?.name
                  }
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Type:</span>
                <span>{paymentType === "Receipt" ? "Receipt" : "Payment"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
