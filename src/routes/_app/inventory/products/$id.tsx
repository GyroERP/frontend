import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const ProductDetailPage = lazy(() =>
  import('@/modules/inventory/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)

export const Route = createFileRoute('/_app/inventory/products/$id')({
  component: function ProductDetailRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <ProductDetailPage productId={id} />
      </Suspense>
    )
  },
})
