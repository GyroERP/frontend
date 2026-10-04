import { cn } from '@/lib/cn'

interface SequenceDisplayProps {
  value: string | null | undefined
  placeholder?: string
  className?: string
}

export function SequenceDisplay({ value, placeholder = 'New', className }: SequenceDisplayProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium',
        value
          ? 'bg-neutral-100 text-neutral-700 border border-neutral-200'
          : 'bg-brand-50 text-brand-600 border border-brand-200',
        className,
      )}
    >
      {value ?? placeholder}
    </span>
  )
}
