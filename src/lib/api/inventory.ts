import { supabase } from '../supabase';

/**
 * Inventory logs API — reads/writes the EXISTING public.inventory_logs table.
 *
 * inventory_logs: id, product_id, movement_type (enum), quantity,
 *                 previous_stock, new_stock, reason, created_by, created_at
 *
 * inventory_movement_type enum: sale | stock_increase | stock_decrease | adjustment
 */

interface InventoryLogRow {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
  products?: { name: string; sku: string } | null;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  createdBy: string | null;
  createdAt: string;
}

/** Confirmed Postgres enum value for sale movements. */
export const SALE_MOVEMENT_TYPE = 'sale' as const;

function mapLog(row: InventoryLogRow): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? 'Unknown product',
    productSku: row.products?.sku ?? '',
    movementType: row.movement_type,
    quantity: row.quantity,
    previousStock: row.previous_stock,
    newStock: row.new_stock,
    reason: row.reason,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

/** Most recent inventory movements, joined to products for display. */
export async function listInventoryLogs(limit = 50): Promise<InventoryLog[]> {
  const { data, error } = await supabase
    .from('inventory_logs')
    .select('*, products(name, sku)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch inventory logs: ${error.message}`);
  }

  return (data ?? []).map((row) => mapLog(row as InventoryLogRow));
}

export interface StockMovementInput {
  productId: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy: string | null;
}

export interface SaleStockDeductionResult {
  product_id: string;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  quantity: number;
}

/**
 * Atomically deduct stock and write an inventory_logs row for a sale.
 * Requires public.deduct_stock_for_sale() in Supabase (see docs/supabase-sale-stock-rpc.sql).
 */
export async function deductStockForSale(
  productId: string,
  quantity: number,
  reason = 'Sale',
): Promise<SaleStockDeductionResult> {
  const { data, error } = await supabase.rpc('deduct_stock_for_sale', {
    product_id: productId,
    quantity,
    reason,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Stock deduction returned no data');
  }

  return data as SaleStockDeductionResult;
}

/** Insert an inventory log for a completed sale using movement_type = "sale". */
export async function createSaleInventoryLog(input: StockMovementInput): Promise<void> {
  const { error } = await supabase.from('inventory_logs').insert({
    product_id: input.productId,
    movement_type: SALE_MOVEMENT_TYPE,
    quantity: input.quantity,
    previous_stock: input.previousStock,
    new_stock: input.newStock,
    reason: input.reason,
    created_by: input.createdBy,
  });

  if (error) {
    throw new Error(`Failed to record inventory log: ${error.message}`);
  }
}
