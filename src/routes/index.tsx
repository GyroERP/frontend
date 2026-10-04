import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'
import { AppLayout } from '@/layouts/AppLayout'

const DashboardPage = lazy(() =>
  import('@/modules/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return (
    <AppLayout>
      <Suspense fallback={<RouteSuspenseFallback />}>
        <DashboardPage />
      </Suspense>
    </AppLayout>
  )
}
