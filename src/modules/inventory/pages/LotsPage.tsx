import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { Tag as TagIcon } from 'lucide-react'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { useDebounce } from '@/hooks/use-debounce'
import { apiClient } from '@/api/client'
import { formatDate } from '@/lib/date'
import type { StockLot, ProductVariant } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

export function LotsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.lots({ search: debouncedSearch, page }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<StockLot>>('/inventory/stock-lots/', {
        params: { search: debouncedSearch || undefined, page },
      }),
    staleTime: 30_000,
  })

  const { data: variantsData } = useQuery({
    queryKey: inventoryKeys.variants('__all__'),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductVariant>>('/inventory/product-variants/', {
        params: { page_size: 500, is_active: true },
      }),
    staleTime: 300_000,
  })

  const variantMap = useMemo(() => {
    const m: Record<string, ProductVariant> = {}
    for (const v of variantsData?.data.results ?? []) m[v.id] = v
    return m
  }, [variantsData])

  const columns: ColumnsType<StockLot> = useMemo(
    () => [
      {
        title: 'Lot / Serial',
        dataIndex: 'name',
        render: (name: string) => (
          <div className="flex items-center gap-2">
            <TagIcon className="size-3.5 text-neutral-400 shrink-0" />
            <span className="font-mono text-sm font-semibold text-neutral-800">{name}</span>
          </div>
        ),
      },
      {
        title: 'Product',
        key: 'product',
        render: (_, row) => {
          const variant = variantMap[row.product]
          return (
            <span className="text-sm text-neutral-700">
              {variant ? (
                variant.combination_name
              ) : (
                <span className="text-neutral-400 font-mono text-xs">
                  {row.product.slice(0, 8)}…
                </span>
              )}
            </span>
          )
        },
      },
      {
        title: 'Expiry Date',
        dataIndex: 'expiry_date',
        render: (val: string | null) => {
          if (!val) return <span className="text-neutral-400 text-sm">—</span>
          const isExpired = new Date(val) < new Date()
          const isSoon =
            !isExpired && new Date(val).getTime() - Date.now() < 30 * 86400 * 1000
          return (
            <Tag color={isExpired ? 'error' : isSoon ? 'warning' : 'default'}>
              {formatDate(val)}
            </Tag>
          )
        },
      },
      {
        title: 'Best Before',
        dataIndex: 'best_before_date',
        render: (date: string | null) => (
          <span className="text-sm text-neutral-500">{formatDate(date)}</span>
        ),
      },
      {
        title: 'Reference',
        dataIndex: 'ref',
        render: (ref: string | null) => (
          <span className="text-sm text-neutral-400 font-mono">{ref ?? '—'}</span>
        ),
      },
      {
        title: 'Received',
        dataIndex: 'received_date',
        render: (date: string | null) => (
          <span className="text-sm text-neutral-400">
            {date ? formatDate(date) : '—'}
          </span>
        ),
      },
    ],
    [variantMap],
  )

  return (
    <PageShell
      title="Lots & Serial Numbers"
      breadcrumbs={[{ label: 'Inventory' }, { label: 'Lots & Serials' }]}
    >
      <div className="mb-4">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by lot name or product…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>
      <ErpProTable
        columns={columns}
        data={data?.data.results ?? []}
        isLoading={isLoading}
        totalCount={data?.data.count ?? 0}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        emptyTitle="No lots or serial numbers"
        emptyDescription="Lots and serial numbers are created during receipts for tracked products."
      />
    </PageShell>
  )
}
