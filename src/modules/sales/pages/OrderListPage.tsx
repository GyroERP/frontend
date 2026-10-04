import { useNavigate } from '@tanstack/react-router'
import { salesKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import type { ColumnsType } from 'antd/es/table'
import type { SalesOrder } from '../api/types'
import { PERMISSIONS } from '@/config/permissions'
import { SavedFilterBar } from '@/erp/list/SavedFilterBar'

export function OrderListPage() {
  const navigate = useNavigate()
  const currencyCode = useCurrencyCode()
  const controller = useListController<SalesOrder>({
    queryKey: (p) => salesKeys.orderList(p),
    url: '/sales/orders/',
  })

  const columns: ColumnsType<SalesOrder> = [
    {
      title: 'Reference',
      dataIndex: 'name',
      render: (name: string) => (
        <span className="font-mono text-sm font-medium text-neutral-700">{name}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'partner_name',
      render: (partnerName: string) => (
        <span className="text-sm text-neutral-700">{partnerName}</span>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'date_order',
      render: (date: string) => (
        <span className="text-sm text-neutral-500">{date ? formatDate(date) : '—'}</span>
      ),
    },
    {
      title: 'Delivery',
      dataIndex: 'commitment_date',
      render: (date: string) => (
        <span className="text-sm text-neutral-500">{date ? formatDate(date) : '—'}</span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'amount_total',
      render: (amount: string) => <MoneyDisplay amount={amount} currencyCode={currencyCode} />,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      render: (state: string) => <StateBadge state={state} />,
    },
  ]

  return (
    <ListPage
      title="Sales Orders"
      breadcrumbs={[{ label: 'Sales' }, { label: 'Orders' }]}
      controller={controller}
      columns={columns}
      searchPlaceholder="Search orders…"
      createLabel="New Order"
      onCreate={() => navigate({ to: '/sales/orders/$id', params: { id: 'new' } })}
      onRowClick={(row) => navigate({ to: '/sales/orders/$id', params: { id: row.id } })}
      createPermission={{ model: PERMISSIONS.SALES_ORDER, action: 'create' }}
      toolbar={
        <SavedFilterBar
          storageKey="gyro.filters.sales-orders"
          presets={[
            { id: 'draft', label: 'Draft', filters: { state: 'DRAFT' } },
            { id: 'confirmed', label: 'Confirmed', filters: { state: 'SALE' } },
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
