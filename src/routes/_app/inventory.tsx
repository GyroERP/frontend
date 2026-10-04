import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { label: 'Overview',       to: '/inventory',              exact: true },
  { label: 'Products',       to: '/inventory/products',     exact: false },
  { label: 'Transfers',      to: '/inventory/transfers',    exact: false },
  { label: 'On-Hand Stock',  to: '/inventory/stock',        exact: false },
  { label: 'Lots & Serials', to: '/inventory/lots',         exact: false },
  { label: 'Warehouses',     to: '/inventory/warehouses',   exact: false },
  { label: 'Attributes',     to: '/inventory/attributes',   exact: false },
]

function InventoryLayout() {
  const { pathname } = useLocation()

  function isActive(item: typeof NAV_ITEMS[number]) {
    if (item.exact) {
      return pathname === item.to || pathname === item.to + '/'
    }
    return pathname === item.to || pathname.startsWith(item.to + '/')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 border-b border-neutral-200 bg-white">
        <nav className="flex items-center gap-0 px-4 overflow-x-auto" aria-label="Inventory sections">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                  active
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/inventory')({
  component: InventoryLayout,
})
