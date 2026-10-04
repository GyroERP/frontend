import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PayrollHubPage = lazy(() =>
  import('@/modules/payroll/pages/PayrollHubPage').then((m) => ({ default: m.PayrollHubPage })),
)

export const Route = createFileRoute('/_app/payroll/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <PayrollHubPage />
    </Suspense>
  ),
})
