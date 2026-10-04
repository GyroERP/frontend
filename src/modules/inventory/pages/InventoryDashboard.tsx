import { useQuery, type QueryKey } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Package, ArrowLeftRight, Layers, Tag, Warehouse, Sliders,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react'
import { apiClient } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { Skeleton } from 'antd'
import { cn } from '@/lib/cn'
import type { PaginatedResponse } from '@/api/types/common'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  icon: React.ReactNode
  iconColor: string
  primaryStat: number | null
  primaryLabel: string
  lines?: { label: string; value: number | string; color?: string }[]
  to: string
  loading?: boolean
}

function StatCard({ title, icon, iconColor, primaryStat, primaryLabel, lines, to, loading }: StatCardProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate({ to } as never)}
      className="group text-left bg-white border border-neutral-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer w-full"
      aria-label={`Go to ${title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('size-10 rounded-lg flex items-center justify-center', iconColor)}>
          {icon}
        </div>
        <span className="text-xs text-neutral-400 group-hover:text-brand-600 transition-colors font-medium">
          View all →
        </span>
      </div>

      <div className="mb-3">
        {loading ? (
          <Skeleton active title={{ style: { width: 64, height: 32, marginBottom: 4 } }} paragraph={false} />
        ) : (
          <p className="text-3xl font-bold text-neutral-800 tabular-nums">
            {primaryStat ?? '—'}
          </p>
        )}
        <p className="text-sm text-neutral-500 mt-0.5">{primaryLabel}</p>
      </div>

      {lines && lines.length > 0 && (
        <div className="space-y-1.5 border-t border-neutral-100 pt-3">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">{line.label}</span>
              {loading ? (
                <Skeleton active title={{ style: { width: 40, height: 14 } }} paragraph={false} />
              ) : (
                <span className={cn('text-xs font-semibold tabular-nums', line.color ?? 'text-neutral-700')}>
                  {line.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

// ── Count fetcher helper ──────────────────────────────────────────────────────

function useCount(key: QueryKey, url: string, params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiClient.get<PaginatedResponse<unknown>>(url, { params: { ...params, page_size: 1 } }),
    staleTime: 60_000,
    select: (res) => res.data.count,
  })
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function InventoryDashboard() {
  const totalProducts  = useCount([...inventoryKeys.productList(), 'count-all'], '/inventory/products/')
  const storableCount  = useCount([...inventoryKeys.productList(), 'count-storable'],  '/inventory/products/', { product_type: 'storable' })
  const consumableCount= useCount([...inventoryKeys.productList(), 'count-consumable'], '/inventory/products/', { product_type: 'consumable' })
  const serviceCount   = useCount([...inventoryKeys.productList(), 'count-service'],   '/inventory/products/', { product_type: 'service' })

  const draftTransfers  = useCount([...inventoryKeys.pickingList(), 'count-draft'],     '/inventory/transfers/', { state: 'draft' })
  const confirmedTransfers = useCount([...inventoryKeys.pickingList(), 'count-conf'],   '/inventory/transfers/', { state: 'confirmed' })
  const assignedTransfers  = useCount([...inventoryKeys.pickingList(), 'count-assign'], '/inventory/transfers/', { state: 'assigned' })

  const totalQuants = useCount([...inventoryKeys.quants(), 'count'], '/inventory/stock-quants/')
  const totalLots   = useCount([...inventoryKeys.lots(),   'count'], '/inventory/stock-lots/')
  const totalWh     = useCount([...inventoryKeys.warehouses(), 'count'], '/inventory/warehouses/')
  const totalLoc    = useCount([...inventoryKeys.locations(), 'count'], '/inventory/stock-locations/', { location_type: 'internal' })
  const totalAttrs  = useCount([...inventoryKeys.attributes(), 'count'], '/inventory/product-attributes/')

  const openTransfers = (draftTransfers.data ?? 0) + (confirmedTransfers.data ?? 0) + (assignedTransfers.data ?? 0)
  const isTransferLoading = draftTransfers.isLoading || confirmedTransfers.isLoading || assignedTransfers.isLoading

  return (
    <div className="p-6 overflow-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-800">Inventory</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage products, stock movements, warehouses and more.
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Products"
          icon={<Package className="size-5 text-brand-600" />}
          iconColor="bg-brand-50"
          primaryStat={totalProducts.data ?? null}
          primaryLabel="total products"
          loading={totalProducts.isLoading}
          to="/inventory/products"
          lines={[
            { label: 'Storable',    value: storableCount.data ?? '—',   color: 'text-blue-600' },
            { label: 'Consumable',  value: consumableCount.data ?? '—', color: 'text-amber-600' },
            { label: 'Service',     value: serviceCount.data ?? '—',    color: 'text-purple-600' },
          ]}
        />

        <StatCard
          title="Transfers"
          icon={<ArrowLeftRight className="size-5 text-green-600" />}
          iconColor="bg-green-50"
          primaryStat={isTransferLoading ? null : openTransfers}
          primaryLabel="open transfers"
          loading={isTransferLoading}
          to="/inventory/transfers"
          lines={[
            { label: 'Draft',    value: draftTransfers.data ?? '—',     color: 'text-neutral-500' },
            { label: 'Confirmed',value: confirmedTransfers.data ?? '—', color: 'text-amber-600' },
            { label: 'Ready',    value: assignedTransfers.data ?? '—',  color: 'text-green-600' },
          ]}
        />

        <StatCard
          title="On-Hand Stock"
          icon={<Layers className="size-5 text-indigo-600" />}
          iconColor="bg-indigo-50"
          primaryStat={totalQuants.data ?? null}
          primaryLabel="stock entries"
          loading={totalQuants.isLoading}
          to="/inventory/stock"
          lines={[
            { label: 'Locations with stock', value: totalLoc.data ?? '—', color: 'text-indigo-600' },
          ]}
        />

        <StatCard
          title="Lots & Serials"
          icon={<Tag className="size-5 text-orange-600" />}
          iconColor="bg-orange-50"
          primaryStat={totalLots.data ?? null}
          primaryLabel="active lots"
          loading={totalLots.isLoading}
          to="/inventory/lots"
        />

        <StatCard
          title="Warehouses"
          icon={<Warehouse className="size-5 text-teal-600" />}
          iconColor="bg-teal-50"
          primaryStat={totalWh.data ?? null}
          primaryLabel="warehouses"
          loading={totalWh.isLoading}
          to="/inventory/warehouses"
          lines={[
            { label: 'Internal locations', value: totalLoc.data ?? '—', color: 'text-teal-600' },
          ]}
        />

        <StatCard
          title="Attributes"
          icon={<Sliders className="size-5 text-rose-600" />}
          iconColor="bg-rose-50"
          primaryStat={totalAttrs.data ?? null}
          primaryLabel="product attributes"
          loading={totalAttrs.isLoading}
          to="/inventory/attributes"
        />
      </div>

      {/* Quick actions row */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <QuickAction icon={<CheckCircle className="size-4 text-green-600" />} label="Validate Receipts"
            to="/inventory/transfers" desc="Confirm incoming goods" />
          <QuickAction icon={<TrendingUp className="size-4 text-blue-600" />} label="Adjust Stock"
            to="/inventory/stock" desc="Physical inventory count" />
          <QuickAction icon={<AlertTriangle className="size-4 text-amber-600" />} label="Check Expiry"
            to="/inventory/lots" desc="Review expiring lots" />
          <QuickAction icon={<Clock className="size-4 text-purple-600" />} label="Pending Transfers"
            to="/inventory/transfers" desc="Items waiting to be processed" />
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, desc, to }: { icon: React.ReactNode; label: string; desc: string; to: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate({ to } as never)}
      className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 hover:border-brand-300 hover:shadow-sm transition-all text-left"
    >
      {icon}
      <div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400">{desc}</p>
      </div>
    </button>
  )
}
