import { supabase } from '../supabase';

/**
 * Inventory logs API — reads/writes the EXISTING public.inventory_logs table.
 *
 * inventory_logs: id, product_id, movement_type (enum), quantity,
 *                 previous_stock, new_stock, reason, created_by, created_at
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

/**
 * `movement_type` is a Postgres enum whose values we must not invent.
 * Existing rows are the only safe client-side source of truth, so we look for
 * an already-used value that represents an outgoing/sale movement. If the
 * table is still empty we fall back to the conventional candidates in order,
 * letting Postgres reject invalid ones.
 */
const SALE_MOVEMENT_CANDIDATES = ['sale', 'sales', 'out', 'stock_out', 'outgoing', 'remove'];

let cachedSaleMovementType: string | null = null;

export async function resolveSaleMovementType(): Promise<string | null> {
  if (cachedSaleMovementType) return cachedSaleMovementType;

  const { data, error } = await supabase
    .from('inventory_logs')
    .select('movement_type')
    .limit(200);

  if (error || !data) return null;

  const used = Array.from(new Set(data.map((r) => String(r.movement_type)))).filter(Boolean);
  const match = used.find((v) => SALE_MOVEMENT_CANDIDATES.includes(v.toLowerCase()));

  if (match) {
    cachedSaleMovementType = match;
    return match;
  }

  return null;
}

export interface StockMovementInput {
  productId: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy: string | null;
}

/**
 * Insert an inventory log row using the enum value already present in the
 * database when possible, otherwise trying known candidate values until one is
 * accepted by the enum. Throws if none can be written.
 */
export async function createSaleInventoryLog(input: StockMovementInput): Promise<void> {
  const resolved = await resolveSaleMovementType();
  const candidates = resolved
    ? [resolved, ...SALE_MOVEMENT_CANDIDATES.filter((c) => c !== resolved)]
    : SALE_MOVEMENT_CANDIDATES;

  let lastError: string | null = null;

  for (const movementType of candidates) {
    const { error } = await supabase.from('inventory_logs').insert({
      product_id: input.productId,
      movement_type: movementType,
      quantity: input.quantity,
      previous_stock: input.previousStock,
      new_stock: input.newStock,
      reason: input.reason,
      created_by: input.createdBy,
    });

    if (!error) {
      cachedSaleMovementType = movementType;
      return;
    }

    lastError = error.message;

    // Only keep probing when the enum value itself was rejected.
    const enumRejected =
      error.message.includes('invalid input value for enum') ||
      error.code === '22P02';
    if (!enumRejected) break;
  }

  throw new Error(`Failed to record inventory log: ${lastError ?? 'unknown error'}`);
}
