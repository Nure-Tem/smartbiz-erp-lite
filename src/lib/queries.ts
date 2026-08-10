import { queryOptions } from "@tanstack/react-query";
import { listProducts } from "./api/products";
import { listCategories } from "./api/categories";
import { listCustomers } from "./api/customers";
import { db } from "./mock/db";

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
 * Query options for sales
 * Still using mock data until sales are connected
 */
export const salesQuery = queryOptions({
  queryKey: ["sales"],
  queryFn: () => db.sales.list(),
});
