// Shared domain types. These intentionally mirror a typical ERP schema so the
// mock layer can later be swapped for a real backend without touching the UI.

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tinNumber: string;
  creditBalance: number;
  createdAt: string;
}

export type PaymentStatus = "paid" | "pending" | "partial";

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  total: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cashier";
}
