import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const OrderDetailPage = lazy(() =>
  import('@/modules/sales/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
)

export const Route = createFileRoute('/_app/sales/orders/$id')({
  component: function OrderDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <OrderDetailPage orderId={id} />
      </Suspense>
    )
  },
})
