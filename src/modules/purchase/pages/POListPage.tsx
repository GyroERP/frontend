import { useNavigate } from '@tanstack/react-router'
import { purchaseKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import type { ColumnsType } from 'antd/es/table'
import type { PurchaseOrder } from '../api/types'
import { PERMISSIONS } from '@/config/permissions'

export function POListPage() {
  const navigate = useNavigate()
  const currencyCode = useCurrencyCode()
  const controller = useListController<PurchaseOrder>({
    queryKey: (p) => purchaseKeys.orderList(p),
    url: '/purchase/orders/',
  })

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'Reference',
      dataIndex: 'name',
      render: (name: string) => (
        <span className="font-mono text-sm font-medium text-neutral-700">{name}</span>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier_name',
      render: (supplierName: string) => (
        <span className="text-sm text-neutral-700">{supplierName}</span>
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
      title: 'Expected',
      dataIndex: 'date_planned',
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
      title="Purchase Orders"
      breadcrumbs={[{ label: 'Purchase' }, { label: 'Orders' }]}
      controller={controller}
      columns={columns}
      searchPlaceholder="Search orders…"
      createLabel="New Order"
      onCreate={() => navigate({ to: '/purchase/orders/$id', params: { id: 'new' } })}
      createPermission={{ model: PERMISSIONS.PURCHASE_ORDER, action: 'create' }}
      onRowClick={(row) => navigate({ to: '/purchase/orders/$id', params: { id: row.id } })}
    />
  )
}
