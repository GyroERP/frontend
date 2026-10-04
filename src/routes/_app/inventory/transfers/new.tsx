import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const TransferFormPage = lazy(() =>
  import('@/modules/inventory/pages/TransferFormPage').then((m) => ({ default: m.TransferFormPage })),
)

export const Route = createFileRoute('/_app/inventory/transfers/new')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <TransferFormPage />
    </Suspense>
  ),
})
