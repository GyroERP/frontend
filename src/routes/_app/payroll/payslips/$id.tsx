import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PayslipDetailPage = lazy(() =>
  import('@/modules/payroll/pages/PayslipDetailPage').then((m) => ({ default: m.PayslipDetailPage })),
)

export const Route = createFileRoute('/_app/payroll/payslips/$id')({
  component: function PayslipDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <PayslipDetailPage payslipId={id} />
      </Suspense>
    )
  },
})
