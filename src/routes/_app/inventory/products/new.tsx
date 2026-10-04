import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const ProductFormPage = lazy(() =>
  import('@/modules/inventory/pages/ProductFormPage').then((m) => ({ default: m.ProductFormPage })),
)

export const Route = createFileRoute('/_app/inventory/products/new')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <ProductFormPage />
    </Suspense>
  ),
})
