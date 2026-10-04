import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ProDescriptions } from '@ant-design/pro-components'
import { Button, Skeleton } from 'antd'
import { accountingKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { WorkflowStatusBar } from '@/erp/enterprise/WorkflowStatusBar'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import { apiClient } from '@/api/client'
import type { AccountMove } from '../api/types'

const MOVE_STEPS = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'POSTED', label: 'Posted' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

interface Props {
  moveId: string
  listPath: string
  title: string
}

export function AccountMoveDetailPage({ moveId, listPath, title }: Props) {
  const navigate = useNavigate()
  const currencyCode = useCurrencyCode()
  const isNew = moveId === 'new'

  const { data, isLoading } = useQuery({
    queryKey: accountingKeys.move(moveId),
    queryFn: () => apiClient.get<AccountMove>(`/accounting/moves/${moveId}/`),
    enabled: !isNew,
    staleTime: 60_000,
  })

  const move = data?.data

  if (!isNew && isLoading) {
    return (
      <PageShell title="…" breadcrumbs={[{ label: 'Accounting' }, { label: '…' }]}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </PageShell>
    )
  }

  if (isNew) {
    return (
      <PageShell
        title={`New ${title}`}
        breadcrumbs={[{ label: 'Accounting' }, { label: title, href: listPath }, { label: 'New' }]}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: listPath })}>
            Back
          </Button>
        }
      >
        <p className="text-sm text-neutral-600 max-w-lg">
          Create invoices from a sales order or use the API for now. This screen will host the full
          invoice composer in a follow-up release.
        </p>
      </PageShell>
    )
  }

  if (!move) return null

  return (
    <PageShell
      title={
        <span className="flex items-center gap-3">
          <span className="font-mono">{move.name || '/'}</span>
          <StateBadge state={move.state} />
        </span>
      }
      breadcrumbs={[
        { label: 'Accounting' },
        { label: title, href: listPath },
        { label: move.name || move.id.slice(0, 8) },
      ]}
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: listPath })}>
          Back
        </Button>
      }
    >
      <WorkflowStatusBar steps={MOVE_STEPS} currentState={move.state} className="mb-6" />
      <ProDescriptions
        column={3}
        dataSource={move}
        columns={[
          { title: 'Partner', dataIndex: 'partner_name' },
          {
            title: 'Invoice Date',
            dataIndex: 'invoice_date',
            render: (_, r) => (r.invoice_date ? formatDate(r.invoice_date) : '—'),
          },
          {
            title: 'Due Date',
            dataIndex: 'due_date',
            render: (_, r) => (r.due_date ? formatDate(r.due_date) : '—'),
          },
          {
            title: 'Total',
            dataIndex: 'amount_total',
            render: (_, r) => <MoneyDisplay amount={r.amount_total} currencyCode={currencyCode} />,
          },
          {
            title: 'Outstanding',
            dataIndex: 'amount_residual',
            render: (_, r) => <MoneyDisplay amount={r.amount_residual} currencyCode={currencyCode} />,
          },
          { title: 'Journal', dataIndex: 'journal_name' },
        ]}
      />
    </PageShell>
  )
}
