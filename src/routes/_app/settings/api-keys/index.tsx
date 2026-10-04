import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const APIKeyPage = lazy(() =>
  import('@/modules/settings/pages/APIKeyPage').then((m) => ({ default: m.APIKeyPage })),
)

export const Route = createFileRoute('/_app/settings/api-keys/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <APIKeyPage />
    </Suspense>
  ),
})
