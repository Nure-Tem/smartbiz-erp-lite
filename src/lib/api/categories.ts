import { supabase } from '../supabase';
import { describeSupabaseError } from './errors';
import type { Category } from '../mock/types';

/**
 * Database type for categories table
 * Matches the Supabase schema
 */
interface CategoryRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

/**
 * Convert database row to application Category type
 */
function mapToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

/**
 * Convert application Category type to database row
 */
function mapFromCategory(category: Omit<Category, 'id' | 'createdAt'>): Omit<CategoryRow, 'id' | 'created_at'> {
  return {
    name: category.name,
    description: category.description,
  };
}

/**
 * Fetch all categories
 */
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(describeSupabaseError(error, 'load', 'category'));
  }

  return (data || []).map(mapToCategory);
}

/**
 * Create a new category
 */
export async function createCategory(
  input: Omit<Category, 'id' | 'createdAt'>
): Promise<Category> {
  const categoryData = mapFromCategory(input);

  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'create', 'category'));
  }

  return mapToCategory(data);
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  input: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  const updateData: Partial<Omit<CategoryRow, 'id' | 'created_at'>> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'update', 'category'));
  }

  return mapToCategory(data);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(describeSupabaseError(error, 'delete', 'category'));
  }
}
