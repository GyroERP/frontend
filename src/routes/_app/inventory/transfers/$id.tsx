import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const TransferDetailPage = lazy(() =>
  import('@/modules/inventory/pages/TransferDetailPage').then((m) => ({ default: m.TransferDetailPage })),
)

export const Route = createFileRoute('/_app/inventory/transfers/$id')({
  component: function TransferDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <TransferDetailPage pickingId={id} />
      </Suspense>
    )
  },
})
