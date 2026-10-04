import { cn } from '@/lib/cn'
import { useCurrencyFormatter } from '@/hooks/use-currency'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MoneyDisplayProps {
  amount: string | number | null | undefined
  currencyCode?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  colorize?: boolean    // green for positive, red for negative
  showSign?: boolean
}

const sizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl font-semibold',
}

/**
 * Renders a formatted currency amount using the current company's currency.
 * Automatically uses Decimal.js — never floats.
 */
export function MoneyDisplay({
  amount,
  currencyCode,
  className,
  size = 'md',
  colorize,
  showSign,
}: MoneyDisplayProps) {
  const { format, currencyCode: companyCurrency } = useCurrencyFormatter()
  const code = currencyCode ?? companyCurrency

  const numVal = parseFloat(String(amount ?? 0))
  const formatted = format(amount)

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        sizeMap[size],
        colorize && numVal > 0 && 'text-green-600',
        colorize && numVal < 0 && 'text-brand-600',
        colorize && numVal === 0 && 'text-neutral-500',
        !colorize && 'text-neutral-700',
        className,
      )}
      title={`${code} ${String(amount ?? 0)}`}
    >
      {showSign && numVal > 0 && '+'}
      {formatted}
    </span>
  )
}

/** Compact KPI stat card for dashboard use. */
interface StatCardProps {
  label: string
  amount: string | number | null
  previousAmount?: string | number | null
  className?: string
}

export function MoneyStatCard({ label, amount, previousAmount, className }: StatCardProps) {
  const { format } = useCurrencyFormatter()

  const current = parseFloat(String(amount ?? 0))
  const previous = parseFloat(String(previousAmount ?? 0))
  const change = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null
  const isUp = change !== null && change >= 0

  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white p-4', className)}>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-800 font-mono tabular-nums">
        {format(amount)}
      </p>
      {change !== null && (
        <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', isUp ? 'text-green-600' : 'text-brand-600')}>
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(change).toFixed(1)}% vs prev. period
        </p>
      )}
    </div>
  )
}
