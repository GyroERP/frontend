import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const TransferListPage = lazy(() =>
  import('@/modules/inventory/pages/TransferListPage').then((m) => ({ default: m.TransferListPage })),
)

export const Route = createFileRoute('/_app/inventory/transfers/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <TransferListPage />
    </Suspense>
  ),
})
