import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const OrderListPage = lazy(() =>
  import('@/modules/sales/pages/OrderListPage').then((m) => ({ default: m.OrderListPage })),
)

export const Route = createFileRoute('/_app/sales/orders/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <OrderListPage />
    </Suspense>
  ),
})
