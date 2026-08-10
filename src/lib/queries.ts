import { queryOptions } from "@tanstack/react-query";
import { listProducts } from "./api/products";
import { listCategories } from "./api/categories";
import { listCustomers } from "./api/customers";
import { listPaymentMethods, listSales } from "./api/sales";

/**
 * Query options for products
 * Uses Supabase API instead of mock data
 */
export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: listProducts,
});

/**
 * Query options for categories
 * Uses Supabase API instead of mock data
 */
export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: listCategories,
});

/**
 * Query options for customers
 * Uses Supabase API instead of mock data
 */
export const customersQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: listCustomers,
});

/**
 * Query options for sales (sales + sale_items)
 * Uses Supabase API instead of mock data
 */
export const salesQuery = queryOptions({
  queryKey: ["sales"],
  queryFn: listSales,
});

/**
 * Distinct payment_method values found in the existing sales table.
 */
export const paymentMethodsQuery = queryOptions({
  queryKey: ["sales", "payment-methods"],
  queryFn: listPaymentMethods,
});
