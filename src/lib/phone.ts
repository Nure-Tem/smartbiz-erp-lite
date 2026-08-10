/**
 * Strip non-digit characters for phone comparison.
 * Display/storage may keep formatting; use this only for duplicate checks.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
