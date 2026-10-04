import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { notify } from '@/lib/notify'
import { apiClient, extractErrorMessage } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { Button, Spin } from 'antd'
import type { ProductTemplate, ProductCategory, Uom } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

const PRODUCT_TYPE_OPTIONS = [
  { value: 'storable', label: 'Storable Product' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'service', label: 'Service' },
]

const TRACKING_OPTIONS = [
  { value: 'none', label: 'No Tracking' },
  { value: 'lot', label: 'By Lot' },
  { value: 'serial', label: 'By Serial Number' },
]

type ProductFormValues = {
  name: string
  internal_ref?: string
  product_type: 'storable' | 'consumable' | 'service'
  category: string
  uom: string
  uom_purchase?: string
  sales_price: number
  standard_price: number
  can_be_sold: boolean
  can_be_purchased: boolean
  tracking: 'none' | 'lot' | 'serial'
  description?: string
  is_active: boolean
}

interface ProductFormPageProps {
  productId?: string
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!productId

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: inventoryKeys.product(productId!),
    queryFn: () => apiClient.get<ProductTemplate>(`/inventory/products/${productId}/`),
    enabled: isEdit,
    staleTime: 60_000,
  })

  const { data: categoriesData } = useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductCategory>>('/inventory/product-categories/', {
        params: { page_size: 200, is_active: true },
      }),
    staleTime: 300_000,
  })

  const { data: uomsData } = useQuery({
    queryKey: ['inventory', 'uoms'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Uom>>('/inventory/uoms/', {
        params: { page_size: 200, is_active: true },
      }),
    staleTime: 300_000,
  })

  const categoryOptions = (categoriesData?.data.results ?? []).map((c) => ({
    value: c.id,
    label: c.full_name || c.name,
  }))

  const uomOptions = (uomsData?.data.results ?? []).map((u) => ({
    value: u.id,
    label: u.symbol ? `${u.name} (${u.symbol})` : u.name,
  }))

  const product = productData?.data

  const initialValues = useMemo((): ProductFormValues => {
    if (!product) {
      return {
        name: '',
        internal_ref: '',
        product_type: 'storable',
        category: '',
        uom: '',
        uom_purchase: '',
        sales_price: 0,
        standard_price: 0,
        can_be_sold: true,
        can_be_purchased: true,
        tracking: 'none',
        description: '',
        is_active: true,
      }
    }
    return {
      name: product.name,
      internal_ref: product.internal_ref ?? '',
      product_type: product.product_type,
      category: product.category ? String(product.category) : '',
      uom: String(product.uom),
      uom_purchase: product.uom_purchase ? String(product.uom_purchase) : '',
      sales_price: parseFloat(product.sales_price) || 0,
      standard_price: parseFloat(product.standard_price) || 0,
      can_be_sold: product.can_be_sold,
      can_be_purchased: product.can_be_purchased,
      tracking: product.tracking,
      description: product.description ?? '',
      is_active: product.is_active,
    }
  }, [product])

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload = { ...values, uom_purchase: values.uom_purchase || values.uom }
      return isEdit
        ? apiClient.patch<ProductTemplate>(`/inventory/products/${productId}/`, payload)
        : apiClient.post<ProductTemplate>('/inventory/products/', payload)
    },
    onSuccess: (res) => {
      notify.success(isEdit ? 'Product updated' : 'Product created')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.products() })
      if (!isEdit) {
        void navigate({ to: '/inventory/products/$id', params: { id: res.data.id } })
      } else {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId!) })
      }
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <PageShell
      title={isEdit ? (product?.name ?? 'Product') : 'New Product'}
      breadcrumbs={[
        { label: 'Inventory', href: '/inventory' },
        { label: 'Products', href: '/inventory/products' },
        { label: isEdit ? (product?.name ?? '…') : 'New Product' },
      ]}
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/inventory/products' })}>
          Back
        </Button>
      }
    >
      <div className="max-w-3xl">
        <ProForm<ProductFormValues>
          key={product?.id ?? 'new'}
          initialValues={initialValues}
          submitter={{
            searchConfig: { submitText: isEdit ? 'Save Changes' : 'Create Product' },
            submitButtonProps: { icon: <SaveOutlined />, loading: saveMutation.isPending },
            resetButtonProps: { style: { display: 'none' } },
          }}
          onFinish={async (values) => {
            await saveMutation.mutateAsync(values)
            return true
          }}
        >
          <ProForm.Group title="General Information">
            <ProFormText name="name" label="Product Name" rules={[{ required: true }]} colProps={{ span: 24 }} />
            <ProFormText name="internal_ref" label="Internal Reference / SKU" colProps={{ span: 8 }} />
            <ProFormSelect name="product_type" label="Product Type" options={PRODUCT_TYPE_OPTIONS} colProps={{ span: 8 }} />
            <ProFormSelect
              name="category"
              label="Category"
              rules={[{ required: true }]}
              options={categoryOptions}
              showSearch
              colProps={{ span: 8 }}
            />
            <ProFormSelect name="tracking" label="Tracking" options={TRACKING_OPTIONS} colProps={{ span: 8 }} />
            <ProFormTextArea name="description" label="Description" colProps={{ span: 24 }} />
          </ProForm.Group>
          <ProForm.Group title="Pricing & Costing">
            <ProFormDigit name="sales_price" label="Sales Price" min={0} fieldProps={{ step: 0.01 }} colProps={{ span: 12 }} />
            <ProFormDigit name="standard_price" label="Cost (Standard Price)" min={0} fieldProps={{ step: 0.01 }} colProps={{ span: 12 }} />
          </ProForm.Group>
          <ProForm.Group title="Units of Measure">
            <ProFormSelect name="uom" label="Unit of Measure" rules={[{ required: true }]} options={uomOptions} showSearch colProps={{ span: 12 }} />
            <ProFormSelect name="uom_purchase" label="Purchase UoM" options={uomOptions} showSearch allowClear colProps={{ span: 12 }} />
          </ProForm.Group>
          <ProForm.Group title="Sales & Purchase">
            <ProFormSwitch name="can_be_sold" label="Can be Sold" colProps={{ span: 8 }} />
            <ProFormSwitch name="can_be_purchased" label="Can be Purchased" colProps={{ span: 8 }} />
            <ProFormSwitch name="is_active" label="Active" colProps={{ span: 8 }} />
          </ProForm.Group>
        </ProForm>
      </div>
    </PageShell>
  )
}
