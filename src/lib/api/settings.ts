import { supabase } from '../supabase';

/**
 * Settings API — reads/writes the EXISTING public.settings table.
 *
 * settings: id, business_name, business_logo_url, currency, tax_percentage,
 *           receipt_footer, created_at, updated_at
 */

interface SettingsRow {
  id: string;
  business_name: string;
  business_logo_url: string | null;
  currency: string;
  tax_percentage: number;
  receipt_footer: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string | null;
  businessName: string;
  businessLogoUrl: string;
  currency: string;
  taxPercentage: number;
  receiptFooter: string;
}

export const EMPTY_SETTINGS: BusinessSettings = {
  id: null,
  businessName: '',
  businessLogoUrl: '',
  currency: 'ETB',
  taxPercentage: 0,
  receiptFooter: '',
};

function mapSettings(row: SettingsRow): BusinessSettings {
  return {
    id: row.id,
    businessName: row.business_name,
    businessLogoUrl: row.business_logo_url ?? '',
    currency: row.currency,
    taxPercentage: Number(row.tax_percentage),
    receiptFooter: row.receipt_footer ?? '',
  };
}

/** Load the existing settings row (oldest wins, so we never pick a duplicate). */
export async function getSettings(): Promise<BusinessSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  return data ? mapSettings(data as SettingsRow) : EMPTY_SETTINGS;
}

export type SaveSettingsInput = Omit<BusinessSettings, 'id'>;

/**
 * Persist settings. Updates the existing row when one exists; only inserts if
 * the table is empty, so no duplicate rows are created.
 */
export async function saveSettings(input: SaveSettingsInput): Promise<BusinessSettings> {
  const existing = await getSettings();

  const payload = {
    business_name: input.businessName,
    business_logo_url: input.businessLogoUrl || null,
    currency: input.currency,
    tax_percentage: input.taxPercentage,
    receipt_footer: input.receiptFooter || null,
    updated_at: new Date().toISOString(),
  };

  if (existing.id) {
    const { data, error } = await supabase
      .from('settings')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save settings: ${error.message}`);
    }
    return mapSettings(data as SettingsRow);
  }

  const { data, error } = await supabase
    .from('settings')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }
  return mapSettings(data as SettingsRow);
}
