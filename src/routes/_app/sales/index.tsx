import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const SalesHubPage = lazy(() =>
  import('@/modules/sales/pages/SalesHubPage').then((m) => ({ default: m.SalesHubPage })),
)

export const Route = createFileRoute('/_app/sales/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <SalesHubPage />
    </Suspense>
  ),
})
