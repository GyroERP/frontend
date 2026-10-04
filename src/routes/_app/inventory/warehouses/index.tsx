import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const WarehousePage = lazy(() =>
  import('@/modules/inventory/pages/WarehousePage').then((m) => ({ default: m.WarehousePage })),
)

export const Route = createFileRoute('/_app/inventory/warehouses/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <WarehousePage />
    </Suspense>
  ),
})
