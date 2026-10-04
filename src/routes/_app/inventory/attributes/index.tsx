import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const AttributesPage = lazy(() =>
  import('@/modules/inventory/pages/AttributesPage').then((m) => ({ default: m.AttributesPage })),
)

export const Route = createFileRoute('/_app/inventory/attributes/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <AttributesPage />
    </Suspense>
  ),
})
