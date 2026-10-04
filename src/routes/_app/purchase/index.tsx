import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PurchaseHubPage = lazy(() =>
  import('@/modules/purchase/pages/PurchaseHubPage').then((m) => ({ default: m.PurchaseHubPage })),
)

export const Route = createFileRoute('/_app/purchase/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <PurchaseHubPage />
    </Suspense>
  ),
})
