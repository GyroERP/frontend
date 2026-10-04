import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Warehouse as WarehouseIcon, MapPin } from 'lucide-react'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { apiClient } from '@/api/client'
import type { Warehouse, StockLocation } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

const warehouseColumns: ColumnsType<Warehouse> = [
  {
    title: 'Warehouse',
    dataIndex: 'name',
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <WarehouseIcon className="size-4 text-neutral-400 shrink-0" />
        <div>
          <p className="font-semibold text-neutral-800 text-sm">{row.name}</p>
          <p className="text-xs text-neutral-400 font-mono">{row.code}</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Receipt',
    dataIndex: 'reception_steps',
    render: (steps: string) => (
      <span className="text-sm text-neutral-600 capitalize">{steps.replace(/_/g, ' ')}</span>
    ),
  },
  {
    title: 'Delivery',
    dataIndex: 'delivery_steps',
    render: (steps: string) => (
      <span className="text-sm text-neutral-600 capitalize">{steps.replace(/_/g, ' ')}</span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    render: (active: boolean) => (
      <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Archived'}</Tag>
    ),
  },
]

const locationColumns: ColumnsType<StockLocation> = [
  {
    title: 'Location',
    dataIndex: 'full_name',
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <MapPin className="size-3.5 text-neutral-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-neutral-800">{row.full_name}</p>
          {row.barcode && (
            <p className="text-xs text-neutral-400 font-mono">{row.barcode}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'location_type',
    render: (type: string) => (
      <Tag className="capitalize">{type.replace(/_/g, ' ')}</Tag>
    ),
  },
  {
    title: 'Flags',
    key: 'flags',
    render: (_, row) => (
      <div className="flex gap-1">
        {row.scrap_location && <Tag color="error">Scrap</Tag>}
        {row.is_replenish && <Tag color="processing">Replenish</Tag>}
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    render: (active: boolean) => (
      <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Archived'}</Tag>
    ),
  },
]

type Tab = 'warehouses' | 'locations'

export function WarehousePage() {
  const [tab, setTab] = useState<Tab>('warehouses')
  const [whPage, setWhPage] = useState(1)
  const [locPage, setLocPage] = useState(1)

  const { data: warehousesData, isLoading: whLoading } = useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Warehouse>>('/inventory/warehouses/', {
        params: { page_size: 50 },
      }),
    staleTime: 120_000,
  })

  const { data: locationsData, isLoading: locLoading } = useQuery({
    queryKey: inventoryKeys.locations({ page: locPage, page_size: 50 }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<StockLocation>>('/inventory/stock-locations/', {
        params: { page: locPage, page_size: 50, ordering: 'full_name' },
      }),
    staleTime: 120_000,
    enabled: tab === 'locations',
  })

  return (
    <PageShell
      title="Warehouses & Locations"
      breadcrumbs={[{ label: 'Inventory' }, { label: 'Warehouses' }]}
    >
      <div className="flex gap-0 mb-4 border-b border-neutral-200">
        {(['warehouses', 'locations'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'warehouses' ? (
        <ErpProTable
          columns={warehouseColumns}
          data={warehousesData?.data.results ?? []}
          isLoading={whLoading}
          totalCount={warehousesData?.data.count ?? 0}
          page={whPage}
          pageSize={50}
          onPageChange={setWhPage}
          emptyTitle="No warehouses"
          emptyDescription="Configure warehouses in your company settings."
        />
      ) : (
        <ErpProTable
          columns={locationColumns}
          data={locationsData?.data.results ?? []}
          isLoading={locLoading}
          totalCount={locationsData?.data.count ?? 0}
          page={locPage}
          pageSize={50}
          onPageChange={setLocPage}
          emptyTitle="No locations"
          emptyDescription="Locations are created automatically when you add a warehouse."
        />
      )}
    </PageShell>
  )
}
