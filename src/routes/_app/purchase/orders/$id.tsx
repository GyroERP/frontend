import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PODetailPage = lazy(() =>
  import('@/modules/purchase/pages/PODetailPage').then((m) => ({ default: m.PODetailPage })),
)

export const Route = createFileRoute('/_app/purchase/orders/$id')({
  component: function PODetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <PODetailPage orderId={id} />
      </Suspense>
    )
  },
})
