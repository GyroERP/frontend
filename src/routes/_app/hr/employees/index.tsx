import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const EmployeeListPage = lazy(() =>
  import('@/modules/hr/pages/EmployeeListPage').then((m) => ({ default: m.EmployeeListPage })),
)

export const Route = createFileRoute('/_app/hr/employees/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <EmployeeListPage />
    </Suspense>
  ),
})
