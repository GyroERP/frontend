import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PartnerListPage = lazy(() =>
  import('@/modules/settings/pages/PartnerListPage').then((m) => ({ default: m.PartnerListPage })),
)

export const Route = createFileRoute('/_app/partners/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <PartnerListPage />
    </Suspense>
  ),
})
