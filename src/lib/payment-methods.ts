/** Recorded sale payment methods (Postgres enum `payment_method`). Not payment gateways. */
export const PAYMENT_METHOD_VALUES = [
  'cash',
  'bank',
  'credit',
  'telebirr',
  'ebirr',
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];
