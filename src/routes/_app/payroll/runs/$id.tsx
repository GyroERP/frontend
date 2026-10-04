import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PayrollRunDetailPage = lazy(() =>
  import('@/modules/payroll/pages/PayrollRunDetailPage').then((m) => ({ default: m.PayrollRunDetailPage })),
)

export const Route = createFileRoute('/_app/payroll/runs/$id')({
  component: function PayrollRunDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <PayrollRunDetailPage runId={id} />
      </Suspense>
    )
  },
})
