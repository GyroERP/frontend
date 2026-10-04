import { useMemo } from 'react'
import { useCurrencyCode } from './use-company'
import { formatCurrency, formatNumber } from '@/lib/decimal'

/**
 * Returns a memoized currency formatter bound to the current company's currency.
 *
 * @example
 * const { format } = useCurrencyFormatter()
 * return <span>{format('1234.56')}</span>  // → "$1,234.56"
 */
export function useCurrencyFormatter() {
  const currencyCode = useCurrencyCode()
  return useMemo(
    () => ({
      format: (value: string | number | null | undefined) =>
        formatCurrency(value, currencyCode),
      formatNumber: (value: string | number | null | undefined, decimals?: number) =>
        formatNumber(value, decimals),
      currencyCode,
    }),
    [currencyCode],
  )
}
