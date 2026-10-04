import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Package,
  MapPin, Calendar, FileText, Truck,
} from 'lucide-react'
import { apiClient } from '@/api/client'
import { kernelKeys } from '@/api/query-keys'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { GyroLogger } from '@/erp/enterprise/GyroLogger'
import { WorkflowStatusBar } from '@/erp/enterprise/WorkflowStatusBar'
import { useDocWorkflow, type DocWorkflowState } from '@/erp/workflow/use-doc-workflow'
import { StateTransitionButton } from '@/erp/display/StateTransitionButton'
import { useLookupMap } from '@/erp/hooks/use-lookup-map'
import { Button } from 'antd'
import { StateBadge } from '@/erp/display/StateBadge'
import { PageLoader } from '@/lib/PageLoader'
import { formatDateTime } from '@/lib/date'
import type {
  StockPicking, PickingState, StockLocation, ProductVariant, Uom,
} from '../api/types'

// ── Workflow config — declarative; useDocWorkflow does the rest ───────────────

const CANCEL = {
  label: 'Cancel',
  action: 'cancel',
  variant: 'danger-ghost' as const,
  confirm: 'Cancel this transfer? Reserved stock will be released.',
}

const WORKFLOW_STATES: Record<PickingState, DocWorkflowState> = {
  draft: {
    label: 'Draft',
    description: 'Draft — confirm to check stock availability.',
    actions: [{ label: 'Confirm', action: 'confirm' }, CANCEL],
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Confirmed — check availability to reserve stock.',
    actions: [{ label: 'Check Availability', action: 'assign' }, CANCEL],
  },
  assigned: {
    label: 'Ready',
    description: 'Ready — stock is reserved. Set done quantities and validate.',
    actions: [{ label: 'Validate', action: 'done' }, CANCEL],
  },
  done:      { label: 'Done', description: 'Done — transfer has been validated.' },
  cancelled: { label: 'Cancelled', description: 'Cancelled.' },
}

const WORKFLOW_STEPS: PickingState[] = ['draft', 'confirmed', 'assigned', 'done']

const ACTION_MESSAGES: Record<string, string> = {
  confirm: 'Transfer confirmed',
  assign:  'Stock reserved',
  done:    'Transfer validated',
  cancel:  'Transfer cancelled',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  pickingId: string
}

export function TransferDetailPage({ pickingId }: Props) {
  const navigate = useNavigate()
  const [doneQty, setDoneQty] = useState<Record<string, string>>({})

  const { data: pickingData, isLoading } = useQuery({
    queryKey: inventoryKeys.picking(pickingId),
    queryFn: () => apiClient.get<StockPicking>(`/inventory/transfers/${pickingId}/`),
    staleTime: 30_000,
  })

  // Reference data for display
  const locationMap = useLookupMap<StockLocation>({
    queryKey: inventoryKeys.locations({ page_size: 500 }),
    url: '/inventory/stock-locations/',
    params: { page_size: 500, is_active: true },
    select: (loc) => loc.full_name,
  })

  const variantMap = useLookupMap<ProductVariant, ProductVariant>({
    queryKey: inventoryKeys.variants('__all__'),
    url: '/inventory/product-variants/',
    params: { page_size: 500, is_active: true },
    select: (v) => v,
  })

  const uomMap = useLookupMap<Uom>({
    queryKey: inventoryKeys.uoms({ page_size: 200 }),
    url: '/inventory/uoms/',
    params: { page_size: 200, is_active: true },
    select: (u) => u.symbol || u.name,
  })

  const workflow = useDocWorkflow<PickingState>({
    current: pickingData?.data.state ?? 'draft',
    states: WORKFLOW_STATES,
    steps: WORKFLOW_STEPS,
    endpoint: (action) => `/inventory/transfers/${pickingId}/${action}/`,
    invalidates: [
      inventoryKeys.picking(pickingId),
      inventoryKeys.pickings(),
      kernelKeys.messages('inventory.stockpicking', pickingId),
    ],
    successMessage: (action) => ACTION_MESSAGES[action] ?? 'Action completed',
    beforeAction: async (action) => {
      // Persist done quantities before validating
      if (action !== 'done') return
      const moves = pickingData?.data.moves ?? []
      const patches = moves
        .filter((m) => doneQty[m.id] !== undefined)
        .map((m) =>
          apiClient.patch(`/inventory/stock-moves/${m.id}/`, {
            quantity_done: parseFloat(doneQty[m.id] ?? '0') || 0,
          }),
        )
      if (patches.length > 0) await Promise.all(patches)
    },
  })

  if (isLoading) return <PageLoader size="lg" />

  const picking = pickingData?.data
  if (!picking) return null

  const moves = picking.moves
  const isAssigned  = picking.state === 'assigned'
  const isDone      = picking.state === 'done'
  const isCancelled = picking.state === 'cancelled'

  const totalPlanned = moves.reduce((s, m) => s + parseFloat(m.product_qty), 0)
  const totalDone    = moves.reduce((s, m) => s + parseFloat(m.quantity_done), 0)

  return (
    <PageShell
      title={
        <span className="flex items-center gap-2">
          <Truck className="size-5 text-neutral-400" />
          {picking.name}
        </span>
      }
      breadcrumbs={[
        { label: 'Inventory', href: '/inventory' },
        { label: 'Transfers', href: '/inventory/transfers' },
        { label: picking.name },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate({ to: '/inventory/transfers' })}
          >
            Back
          </Button>
          <StateTransitionButton transitions={workflow.transitions} />
        </div>
      }
      aside={<GyroLogger contentType="inventory.stockpicking" objectId={pickingId} />}
    >
      <div className="space-y-6">
        {/* Workflow progress */}
        {picking.state !== 'cancelled' && (
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <WorkflowStatusBar steps={workflow.steps} currentState={picking.state} />
          </div>
        )}

        {/* Status banner */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 bg-white">
          <StateBadge state={picking.state} />
          <span className="text-sm text-neutral-500">{workflow.description}</span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transfer info */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Transfer Info
            </h3>
            <InfoRow icon={<Package className="size-4 text-neutral-400" />} label="Reference">
              <span className="font-mono font-semibold text-neutral-800">{picking.name}</span>
            </InfoRow>
            {picking.origin && (
              <InfoRow icon={<FileText className="size-4 text-neutral-400" />} label="Origin">
                {picking.origin}
              </InfoRow>
            )}
            {picking.scheduled_date && (
              <InfoRow icon={<Calendar className="size-4 text-neutral-400" />} label="Scheduled">
                {formatDateTime(picking.scheduled_date)}
              </InfoRow>
            )}
            {isDone && picking.date_done && (
              <InfoRow icon={<CheckCircle2 className="size-4 text-green-500" />} label="Completed">
                {formatDateTime(picking.date_done)}
              </InfoRow>
            )}
          </div>

          {/* Locations */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Locations
            </h3>
            <InfoRow icon={<MapPin className="size-4 text-neutral-400" />} label="From">
              {locationMap[picking.location_src] ?? picking.location_src.slice(0, 8) + '…'}
            </InfoRow>
            <div className="flex items-center justify-center py-1">
              <ArrowRight className="size-4 text-neutral-300" />
            </div>
            <InfoRow icon={<MapPin className="size-4 text-brand-500" />} label="To">
              {locationMap[picking.location_dest] ?? picking.location_dest.slice(0, 8) + '…'}
            </InfoRow>
          </div>
        </div>

        {/* Move lines */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-700">
              Product Lines
              <span className="ml-2 text-xs font-normal text-neutral-400">
                ({moves.length} {moves.length === 1 ? 'line' : 'lines'})
              </span>
            </h3>
            {!isDone && !isCancelled && (
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span>Planned: <strong className="text-neutral-600">{totalPlanned.toFixed(2)}</strong></span>
                <span>Done: <strong className="text-neutral-600">{totalDone.toFixed(2)}</strong></span>
              </div>
            )}
          </div>

          {moves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <Package className="size-8 mb-2" />
              <p className="text-sm">No product lines</p>
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Product</th>
                  <th className="text-right px-4 py-2.5 font-medium">Planned</th>
                  <th className="text-right px-4 py-2.5 font-medium">Done</th>
                  <th className="text-left px-4 py-2.5 font-medium">UoM</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {moves.map((move) => {
                  const variant = variantMap[move.product]
                  const productLabel = variant ? variant.combination_name : move.product.slice(0, 8) + '…'
                  const uomLabel = uomMap[move.product_uom] ?? '—'
                  return (
                    <tr key={move.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-neutral-800">{productLabel}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                        {parseFloat(move.product_qty).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAssigned ? (
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            defaultValue={move.quantity_done}
                            className="w-24 text-right rounded border border-neutral-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            onChange={(e) =>
                              setDoneQty((prev) => ({ ...prev, [move.id]: e.target.value }))
                            }
                            aria-label={`Done quantity for move ${move.id}`}
                          />
                        ) : (
                          <span className="tabular-nums text-neutral-600">
                            {parseFloat(move.quantity_done).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{uomLabel}</td>
                      <td className="px-4 py-3">
                        <StateBadge state={move.state} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table></div>
          )}

          {/* Quick-fill button for assigned state */}
          {isAssigned && moves.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50">
              <Button
                type="text"
                size="small"
                onClick={() => {
                  const newQty: Record<string, string> = {}
                  moves.forEach((m) => { newQty[m.id] = m.product_qty })
                  setDoneQty(newQty)
                  moves.forEach((m) => {
                    const el = document.querySelector<HTMLInputElement>(
                      `input[aria-label="Done quantity for move ${m.id}"]`,
                    )
                    if (el) el.value = m.product_qty
                  })
                }}
              >
                Fill all with planned quantities
              </Button>
            </div>
          )}
        </div>

        {/* Note */}
        {picking.note && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <span className="font-medium">Note: </span>
            {picking.note}
          </div>
        )}
      </div>
    </PageShell>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm text-neutral-700">{children}</p>
      </div>
    </div>
  )
}
