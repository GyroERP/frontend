import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PayrollRunListPage = lazy(() =>
  import('@/modules/payroll/pages/PayrollRunListPage').then((m) => ({ default: m.PayrollRunListPage })),
)

export const Route = createFileRoute('/_app/payroll/runs/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <PayrollRunListPage />
    </Suspense>
  ),
})
