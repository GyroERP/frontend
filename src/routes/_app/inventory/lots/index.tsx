import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const LotsPage = lazy(() =>
  import('@/modules/inventory/pages/LotsPage').then((m) => ({ default: m.LotsPage })),
)

export const Route = createFileRoute('/_app/inventory/lots/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <LotsPage />
    </Suspense>
  ),
})
