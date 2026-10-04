import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const StockPage = lazy(() =>
  import('@/modules/inventory/pages/StockPage').then((m) => ({ default: m.StockPage })),
)

export const Route = createFileRoute('/_app/inventory/stock/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <StockPage />
    </Suspense>
  ),
})
