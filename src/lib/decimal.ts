import Decimal from 'decimal.js'

Decimal.set({ rounding: Decimal.ROUND_HALF_UP, toExpPos: 20, toExpNeg: -20 })

export { Decimal }

/** Parse an API decimal string to Decimal safely. Returns Decimal(0) on null/undefined. */
export function toDecimal(value: string | number | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0)
  return new Decimal(value)
}

/** Format a Decimal (or string/number) as a localized currency string. */
export function formatCurrency(
  value: string | number | Decimal | null | undefined,
  currencyCode = 'USD',
  locale = 'en-US',
): string {
  const amount = toDecimal(value instanceof Decimal ? value.toString() : value)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount.toNumber())
}

/** Format as a plain number with decimal places (no currency symbol). */
export function formatNumber(
  value: string | number | Decimal | null | undefined,
  decimalPlaces = 2,
  locale = 'en-US',
): string {
  const amount = toDecimal(value instanceof Decimal ? value.toString() : value)
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount.toNumber())
}

/** Serialize a Decimal back to a string for API submission. */
export function serializeDecimal(value: Decimal | null | undefined): string | null {
  if (!value) return null
  return value.toFixed(6)
}
