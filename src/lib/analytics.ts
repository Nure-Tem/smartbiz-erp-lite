import type { Sale } from "./api/sales";
import type { Category, Product } from "./mock/types";

/**
 * Analytics helpers — every series here is derived from real Supabase rows
 * (sales, sale_items, products, categories). No demo or placeholder data.
 */

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface RevenuePoint {
  month: string;
  revenue: number;
  cost: number;
}

/** Revenue vs cost of goods for the last `months` calendar months. */
export function revenueByMonth(sales: Sale[], months = 7): RevenuePoint[] {
  const now = new Date();
  const buckets: RevenuePoint[] = [];
  const index = new Map<string, RevenuePoint>();

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point: RevenuePoint = { month: MONTH_LABELS[d.getMonth()]!, revenue: 0, cost: 0 };
    buckets.push(point);
    index.set(key, point);
  }

  for (const sale of sales) {
    const d = new Date(sale.createdAt);
    const point = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!point) continue;
    point.revenue += sale.total;
    point.cost += Math.max(0, sale.total - sale.profit);
  }

  return buckets;
}

export interface OrdersPoint {
  day: string;
  orders: number;
}

/** Order counts for the last 7 days, oldest first. */
export function ordersByDay(sales: Sale[], days = 7): OrdersPoint[] {
  const now = new Date();
  const buckets: OrdersPoint[] = [];
  const index = new Map<string, OrdersPoint>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const point: OrdersPoint = {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      orders: 0,
    };
    buckets.push(point);
    index.set(key, point);
  }

  for (const sale of sales) {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    const point = index.get(key);
    if (point) point.orders += 1;
  }

  return buckets;
}

export interface CategorySlice {
  category: string;
  value: number;
}

/** Revenue share per category, derived from sale_items joined to products. */
export function revenueByCategory(
  sales: Sale[],
  products: Product[],
  categories: Category[],
): CategorySlice[] {
  const categoryOfProduct = new Map(products.map((p) => [p.id, p.categoryId]));
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const totals = new Map<string, number>();

  for (const sale of sales) {
    for (const item of sale.items) {
      const categoryId = categoryOfProduct.get(item.productId);
      const name = (categoryId && categoryName.get(categoryId)) || "Uncategorised";
      totals.set(name, (totals.get(name) ?? 0) + item.subtotal);
    }
  }

  return Array.from(totals.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

/** Cost of goods sold across all sales, from sale_items buying prices. */
export function costOfGoodsSold(sales: Sale[]): number {
  return sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, i) => s + i.buyingPrice * i.quantity, 0),
    0,
  );
}
