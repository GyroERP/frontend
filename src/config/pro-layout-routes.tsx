import type { MenuDataItem } from '@ant-design/pro-components'
import { ModuleIcon } from '@/config/module-icons'
import { MODULES, MODULE_GROUPS, type ModuleGroup } from '@/config/modules'

const ORDERED_GROUPS = Object.entries(MODULE_GROUPS)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as ModuleGroup)

/** Nested sub-routes for active modules (hybrid IA). */
const MODULE_CHILDREN: Record<string, { key: string; name: string; path: string }[]> = {
  inventory: [
    { key: 'inventory-hub', name: 'Overview', path: '/inventory' },
    { key: 'inventory-products', name: 'Products', path: '/inventory/products' },
    { key: 'inventory-transfers', name: 'Transfers', path: '/inventory/transfers' },
    { key: 'inventory-stock', name: 'Stock', path: '/inventory/stock' },
    { key: 'inventory-attributes', name: 'Attributes', path: '/inventory/attributes' },
  ],
  sales: [
    { key: 'sales-hub', name: 'Overview', path: '/sales' },
    { key: 'sales-orders', name: 'Orders', path: '/sales/orders' },
  ],
  purchase: [
    { key: 'purchase-hub', name: 'Overview', path: '/purchase' },
    { key: 'purchase-orders', name: 'Purchase Orders', path: '/purchase/orders' },
  ],
  accounting: [
    { key: 'accounting-hub', name: 'Overview', path: '/accounting' },
    { key: 'accounting-invoices', name: 'Invoices', path: '/accounting/invoices' },
    { key: 'accounting-bills', name: 'Bills', path: '/accounting/bills' },
    { key: 'accounting-accounts', name: 'Chart of Accounts', path: '/accounting/accounts' },
  ],
  hr: [
    { key: 'hr-hub', name: 'Overview', path: '/hr' },
    { key: 'hr-employees', name: 'Employees', path: '/hr/employees' },
  ],
  payroll: [
    { key: 'payroll-hub', name: 'Overview', path: '/payroll' },
    { key: 'payroll-runs', name: 'Runs', path: '/payroll/runs' },
  ],
  kernel: [
    { key: 'settings-hub', name: 'Overview', path: '/settings' },
    { key: 'settings-company', name: 'Company', path: '/settings/company' },
    { key: 'settings-partners', name: 'Partners', path: '/partners' },
    { key: 'settings-api-keys', name: 'API Keys', path: '/settings/api-keys' },
  ],
}

function moduleMenuItem(mod: (typeof MODULES)[number]): MenuDataItem {
  const children = MODULE_CHILDREN[mod.id]
  if (mod.status === 'active' && children?.length) {
    return {
      key: mod.id,
      name: mod.label,
      path: mod.basePath,
      icon: <ModuleIcon name={mod.icon} />,
      children: children.map((c) => ({
        key: c.key,
        name: c.name,
        path: c.path,
      })),
    }
  }
  return {
    key: mod.id,
    name: mod.label,
    path: mod.basePath,
    disabled: mod.status === 'coming_soon',
    icon: <ModuleIcon name={mod.icon} />,
  }
}

/** ProLayout menu tree from the ERP module registry. */
export function buildProLayoutMenu(): MenuDataItem[] {
  const items: MenuDataItem[] = []

  for (const group of ORDERED_GROUPS) {
    const activeModules = MODULES.filter((m) => m.group === group && m.status === 'active')
    const roadmapModules = MODULES.filter((m) => m.group === group && m.status === 'coming_soon')
    if (activeModules.length === 0 && roadmapModules.length === 0) continue

    const children: MenuDataItem[] = activeModules.map(moduleMenuItem)

    if (roadmapModules.length > 0) {
      children.push({
        key: `roadmap-${group}`,
        name: 'Roadmap',
        children: roadmapModules.map((mod) => ({
          key: mod.id,
          name: mod.label,
          path: mod.basePath,
          disabled: true,
          icon: <ModuleIcon name={mod.icon} />,
        })),
      })
    }

    items.push({
      key: `group-${group}`,
      name: MODULE_GROUPS[group]?.label,
      children,
    })
  }

  return items
}

export function selectedMenuKey(pathname: string): string {
  for (const [, children] of Object.entries(MODULE_CHILDREN)) {
    const child = children.find(
      (c) => pathname === c.path || (c.path !== '/' && pathname.startsWith(`${c.path}/`)),
    )
    if (child) return child.key
  }

  const match = MODULES.slice()
    .sort((a, b) => b.basePath.length - a.basePath.length)
    .find(
      (m) => pathname === m.basePath || (m.basePath !== '/' && pathname.startsWith(m.basePath)),
    )
  return match?.id ?? 'dashboard'
}
