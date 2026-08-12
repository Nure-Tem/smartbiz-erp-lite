/**
 * Normalize phone numbers for storage and duplicate detection.
 *
 * Ethiopian formats are canonicalized to +251XXXXXXXXX:
 *   0799129735       → +251799129735
 *   251799129735     → +251799129735
 *   +251799129735    → +251799129735
 *   +251 799 129 735 → +251799129735
 *   +251-799-129-735 → +251799129735
 */
export function normalizePhone(phone: string): string {
  const raw = phone.trim();
  if (!raw) return "";

  // Strip spaces, hyphens, parentheses, plus signs, and other formatting
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Local Ethiopian numbers beginning with 0 → country code 251
  if (digits.startsWith("0")) {
    digits = `251${digits.slice(1)}`;
  }

  // Numbers beginning with 251 (with or without a leading +) → +251…
  if (digits.startsWith("251")) {
    return `+${digits}`;
  }

  // Other numbers: stable digit-only form with leading +
  return `+${digits}`;
}
