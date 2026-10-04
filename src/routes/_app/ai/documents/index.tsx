import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const DocumentOCRPage = lazy(() =>
  import('@/modules/gyroai/pages/DocumentOCRPage').then((m) => ({ default: m.DocumentOCRPage })),
)

export const Route = createFileRoute('/_app/ai/documents/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <DocumentOCRPage />
    </Suspense>
  ),
})
