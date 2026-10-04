import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const SettingsHubPage = lazy(() =>
  import('@/modules/settings/pages/SettingsHubPage').then((m) => ({ default: m.SettingsHubPage })),
)

export const Route = createFileRoute('/_app/settings/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <SettingsHubPage />
    </Suspense>
  ),
})
