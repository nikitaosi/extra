export type CurrencyCode = 'GEL' | 'USD' | 'THB';

const maxMinor = 99_999_999_999n;

export function parseAmountMinor(value: string): bigint | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fractional = ''] = normalized.split('.');
  const amount = BigInt(whole) * 100n + BigInt(fractional.padEnd(2, '0') || '0');
  return amount > 0n && amount <= maxMinor ? amount : null;
}

export function amountInput(minor: bigint): string {
  const whole = minor / 100n;
  const fractional = (minor % 100n).toString().padStart(2, '0');
  return `${whole}.${fractional}`;
}

export function formatMoney(minor: bigint, currency: CurrencyCode): string {
  return new Intl.NumberFormat('en-TH', { style: 'currency', currency }).format(Number(minor) / 100);
}
