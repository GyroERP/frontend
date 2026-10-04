import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const InventoryDashboard = lazy(() =>
  import('@/modules/inventory/pages/InventoryDashboard').then((m) => ({ default: m.InventoryDashboard })),
)

export const Route = createFileRoute('/_app/inventory/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <InventoryDashboard />
    </Suspense>
  ),
})
