import { supabase } from '../supabase';

/**
 * Sales API — reads/writes the existing Supabase `sales` and `sale_items` tables.
 * Column names below mirror the live schema exactly; nothing is invented here.
 *
 * sales:      id, customer_id, subtotal, discount, tax, total_amount, profit,
 *             payment_method, created_by, created_at
 * sale_items: id, sale_id, product_id, quantity, selling_price, buying_price,
 *             subtotal, profit, created_at
 *
 * FKs: sale_items.sale_id -> sales.id, sale_items.product_id -> products.id,
 *      sales.customer_id -> customers.id, sales.created_by -> profiles.id
 */

interface SaleRow {
  id: string;
  customer_id: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  profit: number;
  payment_method: string;
  created_by: string | null;
  created_at: string;
}

interface SaleItemRow {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  buying_price: number;
  subtotal: number;
  profit: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  buyingPrice: number;
  subtotal: number;
  profit: number;
}

export interface Sale {
  id: string;
  customerId: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  paymentMethod: string;
  createdBy: string | null;
  createdAt: string;
  /** Derived display reference — the DB has no invoice number column. */
  invoiceNumber: string;
  /** Date portion of created_at, for the existing table column. */
  date: string;
  items: SaleItem[];
}

function mapToSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    quantity: row.quantity,
    sellingPrice: Number(row.selling_price),
    buyingPrice: Number(row.buying_price),
    subtotal: Number(row.subtotal),
    profit: Number(row.profit),
  };
}

function mapToSale(row: SaleRow & { sale_items?: SaleItemRow[] }): Sale {
  return {
    id: row.id,
    customerId: row.customer_id,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total_amount),
    profit: Number(row.profit),
    paymentMethod: row.payment_method,
    createdBy: row.created_by,
    createdAt: row.created_at,
    invoiceNumber: `INV-${row.id.slice(0, 8).toUpperCase()}`,
    date: row.created_at.slice(0, 10),
    items: (row.sale_items ?? []).map(mapToSaleItem),
  };
}

/**
 * Fetch all sales with their line items (sale_items joined via sale_id FK).
 */
export async function listSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  return (data || []).map((row) => mapToSale(row as SaleRow & { sale_items?: SaleItemRow[] }));
}

/**
 * Distinct payment_method values already present in the database.
 * `payment_method` is a Postgres enum; existing rows are the only safe source
 * of valid values from the client, so we never invent one.
 */
export async function listPaymentMethods(): Promise<string[]> {
  const { data, error } = await supabase.from('sales').select('payment_method');

  if (error) {
    throw new Error(`Failed to fetch payment methods: ${error.message}`);
  }

  return Array.from(new Set((data || []).map((r) => r.payment_method as string))).filter(Boolean);
}

export interface CreateSaleLineInput {
  productId: string;
  quantity: number;
  sellingPrice: number;
  buyingPrice: number;
}

export interface CreateSaleInput {
  customerId: string | null;
  paymentMethod: string;
  discount?: number;
  tax?: number;
  lines: CreateSaleLineInput[];
}

/**
 * Create a sale and its sale_items.
 *
 * NOTE: Supabase JS cannot run both inserts in a single transaction without a
 * database function, which is out of scope here. If the sale_items insert
 * fails, we attempt to delete the parent sale (only admins may delete per the
 * existing RLS), and surface the error either way.
 */
export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('You must be signed in to record a sale.');
  }

  const lines = input.lines.filter((l) => l.productId && l.quantity > 0);
  if (lines.length === 0) {
    throw new Error('Add at least one product to the sale.');
  }

  const itemTotals = lines.map((l) => ({
    ...l,
    subtotal: l.sellingPrice * l.quantity,
    profit: (l.sellingPrice - l.buyingPrice) * l.quantity,
  }));

  const subtotal = itemTotals.reduce((sum, l) => sum + l.subtotal, 0);
  const discount = input.discount ?? 0;
  const tax = input.tax ?? 0;
  const totalAmount = subtotal - discount + tax;
  const profit = itemTotals.reduce((sum, l) => sum + l.profit, 0) - discount;

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: input.customerId,
      subtotal,
      discount,
      tax,
      total_amount: totalAmount,
      profit,
      payment_method: input.paymentMethod,
      created_by: authData.user.id,
    })
    .select()
    .single();

  if (saleError) {
    throw new Error(`Failed to create sale: ${saleError.message}`);
  }

  const { data: items, error: itemsError } = await supabase
    .from('sale_items')
    .insert(
      itemTotals.map((l) => ({
        sale_id: sale.id,
        product_id: l.productId,
        quantity: l.quantity,
        selling_price: l.sellingPrice,
        buying_price: l.buyingPrice,
        subtotal: l.subtotal,
        profit: l.profit,
      })),
    )
    .select();

  if (itemsError) {
    await supabase.from('sales').delete().eq('id', sale.id);
    throw new Error(`Failed to create sale items: ${itemsError.message}`);
  }

  return mapToSale({ ...(sale as SaleRow), sale_items: (items || []) as SaleItemRow[] });
}
