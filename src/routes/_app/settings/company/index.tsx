import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const CompanyDetailPage = lazy(() =>
  import('@/modules/settings/pages/CompanyDetailPage').then((m) => ({ default: m.CompanyDetailPage })),
)

export const Route = createFileRoute('/_app/settings/company/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <CompanyDetailPage />
    </Suspense>
  ),
})
