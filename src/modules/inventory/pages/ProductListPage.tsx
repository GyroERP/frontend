import { Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from '@tanstack/react-router'
import { inventoryKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import { formatNumber } from '@/lib/decimal'
import type { ProductTemplate } from '../api/types'
import { PERMISSIONS } from '@/config/permissions'
import { SavedFilterBar } from '@/erp/list/SavedFilterBar'

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  storable: 'Storable',
  consumable: 'Consumable',
  service: 'Service',
}

const columns: ColumnsType<ProductTemplate> = [
  {
    title: 'Product',
    dataIndex: 'name',
    render: (_, row) => (
      <div className="flex items-center gap-3">
        {row.main_image_url ? (
          <img src={row.main_image_url} alt="" className="size-8 rounded object-cover" />
        ) : (
          <div className="size-8 rounded bg-neutral-100 flex items-center justify-center text-xs text-neutral-400 font-bold">
            {row.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-neutral-800">{row.name}</p>
          {row.internal_ref && (
            <p className="text-xs text-neutral-400">{row.internal_ref}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Category',
    dataIndex: 'category_name',
    render: (category: string) => (
      <span className="text-sm text-neutral-600">{category || '—'}</span>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'product_type',
    render: (type: string) => (
      <Tag>{PRODUCT_TYPE_LABELS[type] ?? type}</Tag>
    ),
  },
  {
    title: 'Sales Price',
    dataIndex: 'sales_price',
    render: (price: string) => (
      <span className="text-sm font-mono text-neutral-700">{formatNumber(price)}</span>
    ),
  },
  {
    title: 'Unit',
    dataIndex: 'uom_name',
    render: (unit: string) => <span className="text-sm text-neutral-500">{unit}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    render: (active: boolean) => (
      <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Archived'}</Tag>
    ),
  },
]

export function ProductListPage() {
  const navigate = useNavigate()
  const controller = useListController<ProductTemplate>({
    queryKey: (p) => inventoryKeys.productList(p),
    url: '/inventory/products/',
  })

  return (
    <ListPage
      title="Products"
      breadcrumbs={[{ label: 'Inventory' }, { label: 'Products' }]}
      controller={controller}
      columns={columns}
      searchPlaceholder="Search products…"
      createLabel="New Product"
      onCreate={() => navigate({ to: '/inventory/products/new' })}
      onRowClick={(row) =>
        navigate({ to: '/inventory/products/$id', params: { id: String(row.id) } })
      }
      createPermission={{ model: PERMISSIONS.PRODUCT, action: 'create' }}
      toolbar={
        <SavedFilterBar
          storageKey="gyro.filters.products"
          presets={[
            { id: 'active', label: 'Active', filters: { is_active: 'true' } },
            { id: 'archived', label: 'Archived', filters: { is_active: 'false' } },
          ]}
          activeFilters={controller.filters}
          onApply={(f) => {
            Object.keys(controller.filters).forEach((k) => controller.setFilter(k, null))
            Object.entries(f).forEach(([k, v]) => controller.setFilter(k, v))
          }}
          onClear={() => Object.keys(controller.filters).forEach((k) => controller.setFilter(k, null))}
        />
      }
    />
  )
}
