import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const POListPage = lazy(() =>
  import('@/modules/purchase/pages/POListPage').then((m) => ({ default: m.POListPage })),
)

export const Route = createFileRoute('/_app/purchase/orders/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <POListPage />
    </Suspense>
  ),
})
