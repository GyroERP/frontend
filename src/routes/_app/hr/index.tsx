import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const HrHubPage = lazy(() =>
  import('@/modules/hr/pages/HrHubPage').then((m) => ({ default: m.HrHubPage })),
)

export const Route = createFileRoute('/_app/hr/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <HrHubPage />
    </Suspense>
  ),
})
