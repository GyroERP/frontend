import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const PartnerDetailPage = lazy(() =>
  import('@/modules/settings/pages/PartnerDetailPage').then((m) => ({ default: m.PartnerDetailPage })),
)

export const Route = createFileRoute('/_app/partners/$id')({
  component: function PartnerDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <PartnerDetailPage partnerId={id} />
      </Suspense>
    )
  },
})
