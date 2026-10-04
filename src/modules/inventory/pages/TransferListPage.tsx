import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { useListController } from '@/erp/hooks/use-list-controller'
import { useLookupMap } from '@/erp/hooks/use-lookup-map'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { StateBadge } from '@/erp/display/StateBadge'
import { formatDateTime } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { StockPicking, PickingTypeCode, OperationType, StockLocation } from '../api/types'

type TypeFilter = 'all' | 'incoming' | 'outgoing' | 'internal'

const TYPE_TABS: { key: TypeFilter; label: string; icon?: React.ReactNode }[] = [
  { key: 'all', label: 'All Transfers' },
  { key: 'incoming', label: 'Receipts', icon: <ArrowDownToLine className="size-3.5" /> },
  { key: 'outgoing', label: 'Deliveries', icon: <ArrowUpFromLine className="size-3.5" /> },
  { key: 'internal', label: 'Internal', icon: <ArrowLeftRight className="size-3.5" /> },
]

const TYPE_TAG_COLOR: Record<PickingTypeCode, string> = {
  incoming: 'success',
  outgoing: 'warning',
  internal: 'processing',
  mrpop: 'default',
  other: 'default',
}

const TYPE_LABEL: Record<PickingTypeCode, string> = {
  incoming: 'Receipt',
  outgoing: 'Delivery',
  internal: 'Internal',
  mrpop: 'Manufacturing',
  other: 'Other',
}

export function TransferListPage() {
  const navigate = useNavigate()
  const controller = useListController<StockPicking>({
    queryKey: (p) => inventoryKeys.pickingList(p),
    url: '/inventory/transfers/',
  })
  const typeFilter = (controller.filters['picking_type__code'] ?? 'all') as TypeFilter

  const opTypeMap = useLookupMap<OperationType, OperationType>({
    queryKey: inventoryKeys.operationTypes({ page_size: 100 }),
    url: '/inventory/operation-types/',
    params: { page_size: 100 },
    select: (op) => op,
  })

  const locationMap = useLookupMap<StockLocation>({
    queryKey: inventoryKeys.locations({ page_size: 500 }),
    url: '/inventory/stock-locations/',
    params: { page_size: 500, is_active: true },
    select: (loc) => loc.full_name,
  })

  const columns: ColumnsType<StockPicking> = useMemo(
    () => [
      {
        title: 'Reference',
        dataIndex: 'name',
        render: (name: string) => (
          <span className="font-mono text-sm font-semibold text-neutral-800">{name}</span>
        ),
      },
      {
        title: 'Type',
        key: 'type',
        render: (_, row) => {
          const opType = opTypeMap[row.picking_type]
          const code = opType?.code
          return code ? (
            <Tag color={TYPE_TAG_COLOR[code] ?? 'default'}>{TYPE_LABEL[code] ?? code}</Tag>
          ) : (
            <span className="text-xs text-neutral-400">—</span>
          )
        },
      },
      {
        title: 'From → To',
        key: 'locations',
        render: (_, row) => (
          <span className="text-sm text-neutral-500">
            {locationMap[row.location_src] ?? '…'} → {locationMap[row.location_dest] ?? '…'}
          </span>
        ),
      },
      {
        title: 'Lines',
        key: 'lines',
        render: (_, row) => (
          <span className="text-sm text-neutral-400">{row.moves.length}</span>
        ),
      },
      {
        title: 'Scheduled',
        dataIndex: 'scheduled_date',
        render: (date: string) => (
          <span className="text-sm text-neutral-500">
            {date ? formatDateTime(date) : '—'}
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'state',
        render: (state: string) => <StateBadge state={state} />,
      },
    ],
    [opTypeMap, locationMap],
  )

  return (
    <PageShell
      title="Transfers"
      breadcrumbs={[{ label: 'Inventory' }, { label: 'Transfers' }]}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate({ to: '/inventory/transfers/new' })}
        >
          New Transfer
        </Button>
      }
    >
      <div className="flex items-center gap-1 mb-4 border-b border-neutral-200 overflow-x-auto">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              controller.setFilter('picking_type__code', tab.key === 'all' ? null : tab.key)
            }
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              typeFilter === tab.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by reference, origin…"
          value={controller.search}
          onChange={(e) => controller.setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ErpProTable
        columns={columns}
        data={controller.rows}
        isLoading={controller.isLoading}
        totalCount={controller.total}
        page={controller.page}
        pageSize={controller.pageSize}
        onPageChange={controller.setPage}
        emptyTitle="No transfers found"
        emptyDescription="Transfers are created automatically from purchase and sales orders, or manually."
        onRowClick={(row) => navigate({ to: '/inventory/transfers/$id', params: { id: row.id } })}
      />
    </PageShell>
  )
}
