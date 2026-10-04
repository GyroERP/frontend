import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalForm, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components'
import { z } from 'zod'
import { SlidersHorizontal, ClipboardEdit } from 'lucide-react'
import { notify } from '@/lib/notify'
import { apiClient, extractErrorMessage } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/cn'
import type { StockQuant, StockLocation, ProductVariant, StockLot } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

// ── Adjust schema ─────────────────────────────────────────────────────────────

const adjustSchema = z.object({
  new_quantity: z.coerce.number().min(0, 'Must be ≥ 0'),
  reason:       z.string().optional(),
})
type AdjustForm = z.infer<typeof adjustSchema>

// ── Adjustment modal ──────────────────────────────────────────────────────────

function AdjustModal({
  quant,
  locationMap,
  variantMap,
  lotMap,
  onClose,
}: {
  quant: StockQuant
  locationMap: Record<string, string>
  variantMap: Record<string, ProductVariant>
  lotMap: Record<string, StockLot>
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const variant = variantMap[quant.product]
  const lot = quant.lot ? lotMap[quant.lot] : null

  const adjustMutation = useMutation({
    mutationFn: (values: AdjustForm) =>
      apiClient.post('/inventory/stock-quants/adjust/', {
        product:      quant.product,
        location:     quant.location,
        company:      quant.company,
        lot:          quant.lot,
        quantity:     values.new_quantity,
        reason:       values.reason || undefined,
      }),
    onSuccess: () => {
      notify.success('Quantity adjusted')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.quants() })
      onClose()
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  return (
    <ModalForm<AdjustForm>
      title="Adjust Quantity"
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      initialValues={{ new_quantity: parseFloat(quant.quantity), reason: '' }}
      modalProps={{ destroyOnClose: true }}
      onFinish={async (values) => {
        await adjustMutation.mutateAsync(values)
        return true
      }}
    >
      <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1 mb-4">
        <p>
          <span className="text-neutral-500">Product:</span>{' '}
          <strong>{variant ? variant.combination_name : `${quant.product.slice(0, 8)}…`}</strong>
        </p>
        <p>
          <span className="text-neutral-500">Location:</span>{' '}
          {locationMap[quant.location] ?? `${quant.location.slice(0, 8)}…`}
        </p>
        {lot && (
          <p>
            <span className="text-neutral-500">Lot:</span> {lot.name}
          </p>
        )}
        <p>
          <span className="text-neutral-500">Current on-hand:</span>{' '}
          <strong>{parseFloat(quant.quantity).toFixed(2)}</strong>
        </p>
      </div>
      <ProFormDigit name="new_quantity" label="New Quantity" min={0} rules={[{ required: true }]} fieldProps={{ step: 0.001 }} />
      <ProFormTextArea name="reason" label="Reason (optional)" fieldProps={{ rows: 2 }} />
    </ModalForm>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function StockPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [locationFilter, setLocationFilter] = useState('')
  const [adjustingQuant, setAdjustingQuant] = useState<StockQuant | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.quants({
      search: debouncedSearch,
      page,
      location: locationFilter || undefined,
    }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<StockQuant>>('/inventory/stock-quants/', {
        params: {
          search:   debouncedSearch || undefined,
          page,
          location: locationFilter || undefined,
          ordering: '-quantity',
        },
      }),
    staleTime: 30_000,
  })

  const { data: locationsData } = useQuery({
    queryKey: inventoryKeys.locations({ page_size: 500 }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<StockLocation>>('/inventory/stock-locations/', {
        params: { page_size: 500, is_active: true, location_type: 'internal' },
      }),
    staleTime: 300_000,
  })

  const { data: variantsData } = useQuery({
    queryKey: inventoryKeys.variants('__all__'),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductVariant>>('/inventory/product-variants/', {
        params: { page_size: 500, is_active: true },
      }),
    staleTime: 300_000,
  })

  const { data: lotsData } = useQuery({
    queryKey: inventoryKeys.lots({ page_size: 500 }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<StockLot>>('/inventory/stock-lots/', {
        params: { page_size: 500 },
      }),
    staleTime: 300_000,
  })

  const locationMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const loc of locationsData?.data.results ?? []) m[loc.id] = loc.full_name
    return m
  }, [locationsData])

  const variantMap = useMemo(() => {
    const m: Record<string, ProductVariant> = {}
    for (const v of variantsData?.data.results ?? []) m[v.id] = v
    return m
  }, [variantsData])

  const lotMap = useMemo(() => {
    const m: Record<string, StockLot> = {}
    for (const l of lotsData?.data.results ?? []) m[l.id] = l
    return m
  }, [lotsData])

  const locationOptions = useMemo(() => [
    { value: '', label: 'All Locations' },
    ...(locationsData?.data.results ?? []).map((l) => ({
      value: l.id,
      label: l.full_name,
    })),
  ], [locationsData])

  const columns: ColumnsType<StockQuant> = useMemo(
    () => [
      {
        title: 'Product',
        key: 'product',
        render: (_, row) => {
          const variant = variantMap[row.product]
          return (
            <span className="text-sm font-medium text-neutral-800">
              {variant ? (
                variant.combination_name
              ) : (
                <span className="text-neutral-400 font-mono">{row.product.slice(0, 8)}…</span>
              )}
            </span>
          )
        },
      },
      {
        title: 'Location',
        key: 'location',
        render: (_, row) => (
          <span className="text-sm text-neutral-600">
            {locationMap[row.location] ?? row.location.slice(0, 8) + '…'}
          </span>
        ),
      },
      {
        title: 'Lot / Serial',
        key: 'lot',
        render: (_, row) => {
          const lot = row.lot ? lotMap[row.lot] : null
          return (
            <span className="text-sm text-neutral-400 font-mono">{lot ? lot.name : '—'}</span>
          )
        },
      },
      {
        title: 'On Hand',
        dataIndex: 'quantity',
        render: (qty: string) => (
          <span className="tabular-nums font-semibold text-neutral-800">
            {parseFloat(qty).toFixed(2)}
          </span>
        ),
      },
      {
        title: 'Reserved',
        dataIndex: 'reserved_quantity',
        render: (qty: string) => (
          <span className="tabular-nums text-amber-600">{parseFloat(qty).toFixed(2)}</span>
        ),
      },
      {
        title: 'Available',
        dataIndex: 'available_quantity',
        render: (qty: string) => {
          const val = parseFloat(qty)
          return (
            <span
              className={cn(
                'tabular-nums font-medium',
                val > 0 ? 'text-green-600' : 'text-neutral-400',
              )}
            >
              {val.toFixed(2)}
            </span>
          )
        },
      },
      {
        title: '',
        key: 'actions',
        render: (_, row) => (
          <Button
            type="text"
            size="small"
            icon={<ClipboardEdit className="size-3.5" />}
            onClick={(e) => {
              e.stopPropagation()
              setAdjustingQuant(row)
            }}
          >
            Adjust
          </Button>
        ),
      },
    ],
    [locationMap, variantMap, lotMap],
  )

  return (
    <>
      <PageShell
        title="On-Hand Stock"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'On-Hand Stock' }]}
        actions={
          <Button
            size="small"
            icon={<SlidersHorizontal className="size-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filters
          </Button>
        }
      >
        {showFilters && (
          <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-wrap gap-3">
            <div className="w-60">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                <Select
                  className="w-full"
                  options={locationOptions}
                  value={locationFilter}
                  onChange={(v) => {
                    setLocationFilter(v)
                    setPage(1)
                  }}
                  loading={!locationsData}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by product or lot…"
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
          emptyTitle="No stock found"
          emptyDescription="Create receipts to add stock to your warehouses."
        />
      </PageShell>

      {adjustingQuant && (
        <AdjustModal
          quant={adjustingQuant}
          locationMap={locationMap}
          variantMap={variantMap}
          lotMap={lotMap}
          onClose={() => setAdjustingQuant(null)}
        />
      )}
    </>
  )
}
