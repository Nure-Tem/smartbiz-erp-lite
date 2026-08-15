import { supabase } from '../supabase';
import { normalizePhone } from '../phone';
import { describeSupabaseError } from './errors';
import type { Customer } from '../mock/types';

const PHONE_TAKEN_ERROR = 'A customer with this phone number already exists.';

/**
 * Database type for customers table
 * Matches the Supabase schema
 */
interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_balance: number;
  created_at: string;
}

/**
 * Convert database row to application Customer type
 */
function mapToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    creditBalance: row.credit_balance,
    createdAt: row.created_at,
  };
}

/**
 * Convert application Customer type to database row
 */
function mapFromCustomer(
  customer: Omit<Customer, 'id' | 'createdAt'>,
): Omit<CustomerRow, 'id' | 'created_at'> {
  const trimmedPhone = customer.phone.trim();
  return {
    name: customer.name,
    // Store the canonical form so future duplicate checks stay consistent
    phone: trimmedPhone ? normalizePhone(trimmedPhone) : "",
    email: customer.email,
    address: customer.address,
    credit_balance: customer.creditBalance,
  };
}

/**
 * Returns true if another customer already uses the same normalized phone.
 */
export async function isPhoneTaken(phone: string, excludeId?: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;

  const { data, error } = await supabase.from('customers').select('id, phone');

  if (error) {
    throw new Error(describeSupabaseError(error, 'load', 'customer'));
  }

  return (data ?? []).some(
    (row) => row.id !== excludeId && normalizePhone(row.phone) === normalized,
  );
}

async function assertPhoneAvailable(phone: string, excludeId?: string): Promise<void> {
  if (await isPhoneTaken(phone, excludeId)) {
    throw new Error(PHONE_TAKEN_ERROR);
  }
}

/**
 * Fetch all customers
 */
export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(describeSupabaseError(error, 'load', 'customer'));
  }

  return (data || []).map(mapToCustomer);
}

/**
 * Create a new customer
 */
export async function createCustomer(
  input: Omit<Customer, 'id' | 'createdAt'>,
): Promise<Customer> {
  const customerData = mapFromCustomer(input);

  await assertPhoneAvailable(customerData.phone);

  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'create', 'customer'));
  }

  return mapToCustomer(data);
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  id: string,
  input: Partial<Omit<Customer, 'id' | 'createdAt'>>,
): Promise<Customer> {
  const updateData: Partial<Omit<CustomerRow, 'id' | 'created_at'>> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) {
    const trimmedPhone = input.phone.trim();
    const normalizedPhone = trimmedPhone ? normalizePhone(trimmedPhone) : "";

    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('phone')
      .eq('id', id)
      .single();

    if (existingError) {
      throw new Error(describeSupabaseError(existingError, 'load', 'customer'));
    }

    const phoneChanged =
      normalizePhone(existing.phone) !== normalizePhone(normalizedPhone);

    if (phoneChanged) {
      await assertPhoneAvailable(normalizedPhone, id);
    }

    updateData.phone = normalizedPhone;
  }
  if (input.email !== undefined) updateData.email = input.email;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.creditBalance !== undefined) updateData.credit_balance = input.creditBalance;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(describeSupabaseError(error, 'update', 'customer'));
  }

  return mapToCustomer(data);
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id);

  if (error) {
    throw new Error(describeSupabaseError(error, 'delete', 'customer'));
  }
}
