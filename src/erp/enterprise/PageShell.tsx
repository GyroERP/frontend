import { PageContainer } from '@ant-design/pro-components'
import { cn } from '@/lib/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageShellProps {
  title: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  children: React.ReactNode
  aside?: React.ReactNode
  className?: string
  tabList?: { key: string; tab: React.ReactNode }[]
  tabActiveKey?: string
  onTabChange?: (key: string) => void
}

export function PageShell({
  title,
  breadcrumbs,
  actions,
  children,
  aside,
  className,
  tabList,
  tabActiveKey,
  onTabChange,
}: PageShellProps) {
  const breadcrumbItems =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          items: breadcrumbs.map((item, i) => ({
            title: item.href ? <a href={item.href}>{item.label}</a> : item.label,
            key: `${item.label}-${i}`,
          })),
        }
      : undefined

  const body = aside ? (
    <div className="flex flex-1 min-h-0 flex-col xl:flex-row gap-0 xl:gap-4">
      <div className="flex-1 min-w-0">{children}</div>
      <aside className="w-full xl:w-[380px] shrink-0 xl:sticky xl:top-0 xl:self-start">
        {aside}
      </aside>
    </div>
  ) : (
    children
  )

  return (
    <PageContainer
      className={cn(className)}
      title={title}
      extra={actions}
      breadcrumb={breadcrumbItems}
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={onTabChange}
    >
      {body}
    </PageContainer>
  )
}

interface FilterBarProps {
  children: React.ReactNode
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return <div className={cn('flex flex-wrap items-center gap-3 mb-4', className)}>{children}</div>
}
