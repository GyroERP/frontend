import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const EmployeeDetailPage = lazy(() =>
  import('@/modules/hr/pages/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage })),
)

export const Route = createFileRoute('/_app/hr/employees/$id')({
  component: function EmployeeDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <EmployeeDetailPage employeeId={id} />
      </Suspense>
    )
  },
})
