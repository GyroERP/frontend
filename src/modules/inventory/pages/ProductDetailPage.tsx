import { lazy, Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Package, Sliders, Layers, Image as ImageIcon, Users, Tag as TagIcon } from 'lucide-react'
import { apiClient } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { GyroLogger } from '@/erp/enterprise/GyroLogger'
import { Button, Spin, Tag } from 'antd'
import type { ProductTemplate } from '../api/types'

const OverviewTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.OverviewTab })),
)
const AttributesTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.AttributesTab })),
)
const VariantsTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.VariantsTab })),
)
const ImagesTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.ImagesTab })),
)
const SuppliersTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.SuppliersTab })),
)
const BarcodesTab = lazy(() =>
  import('./product/ProductDetailTabs').then((m) => ({ default: m.BarcodesTab })),
)

type TabKey = 'overview' | 'attributes' | 'variants' | 'images' | 'suppliers' | 'barcodes'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <Package className="size-3.5" /> },
  { key: 'attributes', label: 'Attributes', icon: <Sliders className="size-3.5" /> },
  { key: 'variants', label: 'Variants', icon: <Layers className="size-3.5" /> },
  { key: 'images', label: 'Images', icon: <ImageIcon className="size-3.5" /> },
  { key: 'suppliers', label: 'Supplier Prices', icon: <Users className="size-3.5" /> },
  { key: 'barcodes', label: 'Barcodes', icon: <TagIcon className="size-3.5" /> },
]

interface Props {
  productId: string
}

function TabFallback() {
  return (
    <div className="flex justify-center py-12">
      <Spin />
    </div>
  )
}

export function ProductDetailPage({ productId }: Props) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('overview')

  const { data: productData, isLoading } = useQuery({
    queryKey: inventoryKeys.product(productId),
    queryFn: () => apiClient.get<ProductTemplate>(`/inventory/products/${productId}/`),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const product = productData?.data
  if (!product) return null

  return (
    <PageShell
      title={
        <span className="flex items-center gap-2">
          <Package className="size-5 text-neutral-400" />
          {product.name}
        </span>
      }
      breadcrumbs={[
        { label: 'Inventory', href: '/inventory' },
        { label: 'Products', href: '/inventory/products' },
        { label: product.name },
      ]}
      actions={
        <Button
          type="text"
          size="small"
          icon={<ArrowLeft className="size-4" />}
          onClick={() => navigate({ to: '/inventory/products' })}
        >
          Back
        </Button>
      }
      aside={<GyroLogger contentType="inventory.producttemplate" objectId={productId} />}
      tabList={TABS.map((t) => ({ key: t.key, tab: t.label }))}
      tabActiveKey={tab}
      onTabChange={(k) => setTab(k as TabKey)}
    >
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-neutral-200">
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt=""
            className="size-16 rounded-lg object-cover border border-neutral-200"
          />
        ) : (
          <div className="size-16 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Package className="size-6 text-neutral-400" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{product.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            {product.internal_ref && (
              <span className="text-xs text-neutral-400 font-mono">{product.internal_ref}</span>
            )}
            <Tag color={product.product_type === 'service' ? 'processing' : 'blue'}>{product.product_type}</Tag>
            <Tag color={product.is_active ? 'success' : 'default'}>
              {product.is_active ? 'Active' : 'Archived'}
            </Tag>
            {product.tracking !== 'none' && <Tag color="warning">{product.tracking} tracking</Tag>}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {product.category_name} · {product.uom_name}
            {product.variant_count > 1 && ` · ${product.variant_count} variants`}
          </p>
        </div>
      </div>

      <Suspense fallback={<TabFallback />}>
        {tab === 'overview' && <OverviewTab product={product} />}
        {tab === 'attributes' && <AttributesTab productId={productId} />}
        {tab === 'variants' && (
          <VariantsTab productId={productId} onSwitchToAttributes={() => setTab('attributes')} />
        )}
        {tab === 'images' && <ImagesTab productId={productId} />}
        {tab === 'suppliers' && <SuppliersTab productId={productId} />}
        {tab === 'barcodes' && <BarcodesTab productId={productId} />}
      </Suspense>
    </PageShell>
  )
}
