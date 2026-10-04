import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const InvoiceListPage = lazy(() =>
  import('@/modules/accounting/pages/InvoiceListPage').then((m) => ({ default: m.InvoiceListPage })),
)

export const Route = createFileRoute('/_app/accounting/invoices/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <InvoiceListPage moveType="CUSTOMER_INVOICE" title="Invoices" />
    </Suspense>
  ),
})
