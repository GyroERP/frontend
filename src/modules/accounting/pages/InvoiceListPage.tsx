import { useNavigate } from '@tanstack/react-router'
import { accountingKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import type { ColumnsType } from 'antd/es/table'
import type { AccountMove } from '../api/types'
import { PERMISSIONS } from '@/config/permissions'

const MOVE_TYPE_LABELS: Record<string, string> = {
  CUSTOMER_INVOICE: 'Invoice',
  VENDOR_BILL: 'Bill',
  CUSTOMER_REFUND: 'Credit Note',
  VENDOR_REFUND: 'Vendor Refund',
  GENERAL: 'Journal Entry',
}

interface InvoiceListPageProps {
  moveType?: string
  title?: string
}

export function InvoiceListPage({ moveType = 'CUSTOMER_INVOICE', title = 'Invoices' }: InvoiceListPageProps) {
  const navigate = useNavigate()
  const currencyCode = useCurrencyCode()
  const controller = useListController<AccountMove>({
    queryKey: (p) => accountingKeys.moveList(p),
    url: '/accounting/moves/',
    extraParams: { move_type: moveType },
  })

  const columns: ColumnsType<AccountMove> = [
    {
      title: 'Number',
      dataIndex: 'name',
      render: (name: string) => (
        <span className="font-mono text-sm font-medium text-neutral-700">{name || '/'}</span>
      ),
    },
    {
      title: moveType === 'out_invoice' ? 'Customer' : 'Vendor',
      dataIndex: 'partner_name',
      render: (partnerName: string) => (
        <span className="text-sm text-neutral-700">{partnerName ?? '—'}</span>
      ),
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoice_date',
      render: (date: string) => (
        <span className="text-sm text-neutral-500">{date ? formatDate(date) : '—'}</span>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
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
      title: 'Outstanding',
      dataIndex: 'amount_residual',
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
      title={title}
      breadcrumbs={[
        { label: 'Accounting' },
        { label: MOVE_TYPE_LABELS[moveType] ?? title },
      ]}
      controller={controller}
      columns={columns}
      createLabel={`New ${MOVE_TYPE_LABELS[moveType] ?? 'Document'}`}
      onCreate={() => navigate({ to: '/accounting/moves/$id', params: { id: 'new' } })}
      onRowClick={(row) => navigate({ to: '/accounting/moves/$id', params: { id: row.id } })}
      createPermission={{ model: PERMISSIONS.MOVE, action: 'create' }}
    />
  )
}
