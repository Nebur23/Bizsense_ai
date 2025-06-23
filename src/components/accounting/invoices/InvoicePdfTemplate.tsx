"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 18, fontWeight: "bold" },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableCell: { flex: 1, padding: 5, fontSize: 10 },
});

interface Props {
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    customer: {
      name: string;
      phone?: string;
      email?: string;
    };
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      lineTotal: number;
    }>;
    payments: Array<{
      paymentNumber: string;
      amount: number;
      paymentDate: string;
      method: string;
    }>;
  };
}

export const InvoicePdfTemplate = ({ invoice }: Props) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text>{invoice.invoiceNumber}</Text>
        </View>
        <View>
          <Text>
            Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
          </Text>
          <Text>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text>Billed To:</Text>
        <Text>{invoice.customer.name}</Text>
        {invoice.customer.phone && <Text>{invoice.customer.phone}</Text>}
        {invoice.customer.email && <Text>{invoice.customer.email}</Text>}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Product</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Unit Price</Text>
          <Text style={styles.tableCell}>Tax (%)</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productName}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>
              {item.unitPrice.toFixed(2)} XAF
            </Text>
            <Text style={styles.tableCell}>{item.taxRate.toFixed(2)}</Text>
            <Text style={styles.tableCell}>
              {item.lineTotal.toFixed(2)} XAF
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={{ ...styles.section, alignItems: "flex-end" }}>
        <Text>Subtotal: {invoice.subtotal.toFixed(2)} XAF</Text>
        <Text>Tax: {invoice.taxAmount.toFixed(2)} XAF</Text>
        <Text>Total: {invoice.totalAmount.toFixed(2)} XAF</Text>
      </View>
    </Page>
  </Document>
);
