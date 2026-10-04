import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const InvoiceListPage = lazy(() =>
  import('@/modules/accounting/pages/InvoiceListPage').then((m) => ({ default: m.InvoiceListPage })),
)

export const Route = createFileRoute('/_app/accounting/bills/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <InvoiceListPage moveType="VENDOR_BILL" title="Vendor Bills" />
    </Suspense>
  ),
})
