import { queryOptions } from "@tanstack/react-query";
import { db } from "./db";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => db.categories.list(),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => db.products.list(),
});

export const customersQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: () => db.customers.list(),
});

export const salesQuery = queryOptions({
  queryKey: ["sales"],
  queryFn: () => db.sales.list(),
});
