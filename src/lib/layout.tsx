/**
 * Page layout helpers — spacing and form grids (not a duplicate design system).
 * Prefer Ant Design Card / Row / Col for new pages; these preserve existing patterns.
 */
import { Card, Typography } from 'antd'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const { Title } = Typography

interface PageStackProps {
  children: ReactNode
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PageStack({ children, gap = 'md', className }: PageStackProps) {
  const gapClass = { sm: 'space-y-3', md: 'space-y-6', lg: 'space-y-8' }[gap]
  return <div className={cn('w-full', gapClass, className)}>{children}</div>
}

interface FormSectionProps {
  title?: ReactNode
  headerActions?: ReactNode
  card?: boolean
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  headerActions,
  card = true,
  children,
  className,
}: FormSectionProps) {
  const header =
    title || headerActions ? (
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {title && (
          <Title level={5} className="!mb-0 !text-xs uppercase tracking-wider text-neutral-500">
            {title}
          </Title>
        )}
        {headerActions}
      </div>
    ) : null

  if (!card) {
    return (
      <div className={className}>
        {header}
        {children}
      </div>
    )
  }

  return (
    <Card className={className} styles={{ body: { padding: '16px 20px' } }}>
      {header}
      {children}
    </Card>
  )
}

interface FieldGridProps {
  cols?: 2 | 3 | 4
  children: ReactNode
  className?: string
}

const COLS_CLASS: Record<NonNullable<FieldGridProps['cols']>, string> = {
  2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
}

export function FieldGrid({ children, cols = 2, className }: FieldGridProps) {
  return <div className={cn(COLS_CLASS[cols], className)}>{children}</div>
}

FieldGrid.Full = function FieldGridFull({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('col-span-full', className)}>{children}</div>
}
