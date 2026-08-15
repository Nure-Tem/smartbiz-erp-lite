import { supabase } from '../supabase';
import { describeSupabaseError } from './errors';
import type { Product } from '../mock/types';

/**
 * Database type for products table
 * Matches the Supabase schema
 */
interface ProductRow {
  id: string;
  name: string;
  sku: string;
  image_url: string;
  category_id: string;
  buying_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  created_at: string;
}

/**
 * Convert database row to application Product type
 */
function mapToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    imageUrl: row.image_url,
    categoryId: row.category_id,
    buyingPrice: row.buying_price,
    sellingPrice: row.selling_price,
    stock: row.current_stock,
    minStock: row.minimum_stock,
    createdAt: row.created_at,
  };
}

/**
 * Convert application Product type to database row
 */
function mapFromProduct(product: Omit<Product, 'id' | 'createdAt'>): Omit<ProductRow, 'id' | 'created_at'> {
  return {
    name: product.name,
    sku: product.sku,
    image_url: product.imageUrl,
    category_id: product.categoryId,
    buying_price: product.buyingPrice,
    selling_price: product.sellingPrice,
    current_stock: product.stock,
    minimum_stock: product.minStock,
  };
}

/**
 * Fetch all products
 */
export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(describeSupabaseError(error, 'load', 'product'));
  }

  return (data || []).map(mapToProduct);
}

/**
 * Create a new product
 */
export async function createProduct(
  input: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const productData = mapFromProduct(input);

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'create', 'product'));
  }

  return mapToProduct(data);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  input: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product> {
  const updateData: Partial<Omit<ProductRow, 'id' | 'created_at'>> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.sku !== undefined) updateData.sku = input.sku;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
  if (input.buyingPrice !== undefined) updateData.buying_price = input.buyingPrice;
  if (input.sellingPrice !== undefined) updateData.selling_price = input.sellingPrice;
  if (input.stock !== undefined) updateData.current_stock = input.stock;
  if (input.minStock !== undefined) updateData.minimum_stock = input.minStock;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'update', 'product'));
  }

  return mapToProduct(data);
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(describeSupabaseError(error, 'delete', 'product'));
  }
}
