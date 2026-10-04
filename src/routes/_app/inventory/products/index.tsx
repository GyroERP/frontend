import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const ProductListPage = lazy(() =>
  import('@/modules/inventory/pages/ProductListPage').then((m) => ({ default: m.ProductListPage })),
)

export const Route = createFileRoute('/_app/inventory/products/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <ProductListPage />
    </Suspense>
  ),
})
