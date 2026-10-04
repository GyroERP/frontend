import { useState } from 'react'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, X,
  Tag as TagIcon, Users, Layers, Image as ImageIcon, Sliders, Check,
} from 'lucide-react'
import { SaveOutlined } from '@ant-design/icons'
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
import { kernelKeys } from '@/api/query-keys'
import { inventoryKeys } from '../../api/keys'
import { Button, Input, Select, Spin, Tag } from 'antd'
import { cn } from '@/lib/cn'
import type {
  ProductTemplate, ProductCategory, Uom,
  ProductVariant, ProductSupplierInfo, ProductBarcode,
  ProductAttribute, ProductTemplateAttributeLine, ProductImage,
} from '../../api/types'
import type { PaginatedResponse } from '@/api/types/common'
// ── Overview form ─────────────────────────────────────────────────────────────

const productSchema = z.object({
  name:             z.string().min(1, 'Name is required'),
  internal_ref:     z.string().optional(),
  product_type:     z.enum(['storable', 'consumable', 'service']),
  category:         z.string().min(1, 'Category is required'),
  uom:              z.string().min(1, 'Unit of measure is required'),
  uom_purchase:     z.string().optional(),
  sales_price:      z.coerce.number().min(0),
  standard_price:   z.coerce.number().min(0),
  can_be_sold:      z.boolean(),
  can_be_purchased: z.boolean(),
  tracking:         z.enum(['none', 'lot', 'serial']),
  description:      z.string().optional(),
  is_active:        z.boolean(),
})
type ProductFormValues = z.infer<typeof productSchema>

const PRODUCT_TYPE_OPTIONS = [
  { value: 'storable',   label: 'Storable Product' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'service',    label: 'Service' },
]
const TRACKING_OPTIONS = [
  { value: 'none',   label: 'No Tracking' },
  { value: 'lot',    label: 'By Lot' },
  { value: 'serial', label: 'By Serial Number' },
]

export function OverviewTab({ product }: { product: ProductTemplate }) {
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductCategory>>('/inventory/product-categories/', {
        params: { page_size: 200 },
      }),
    staleTime: 300_000,
  })

  const { data: uomsData } = useQuery({
    queryKey: inventoryKeys.uoms(),
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

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      apiClient.patch<ProductTemplate>(`/inventory/products/${product.id}/`, {
        ...values,
        uom_purchase: values.uom_purchase || values.uom,
      }),
    onSuccess: () => {
      notify.success('Product updated')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.products() })
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.product(product.id) })
      void queryClient.invalidateQueries({
        queryKey: kernelKeys.messages('inventory.producttemplate', product.id),
      })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const initialValues = {
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

  return (
    <ProForm<ProductFormValues>
      key={product.id}
      initialValues={initialValues}
      submitter={{
        searchConfig: { submitText: 'Save Changes' },
        submitButtonProps: { icon: <SaveOutlined />, loading: saveMutation.isPending },
        resetButtonProps: { style: { display: 'none' } },
      }}
      onFinish={async (values) => {
        await saveMutation.mutateAsync({
          ...values,
          uom_purchase: values.uom_purchase || values.uom,
        })
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
        <ProFormSwitch name="can_be_sold" label="Can be Sold" extra="Appears on sales orders" colProps={{ span: 8 }} />
        <ProFormSwitch name="can_be_purchased" label="Can be Purchased" extra="Appears on purchase orders" colProps={{ span: 8 }} />
        <ProFormSwitch name="is_active" label="Active" extra="Inactive products are hidden" colProps={{ span: 8 }} />
      </ProForm.Group>
    </ProForm>
  )
}

// ── Attributes Tab ────────────────────────────────────────────────────────────

export function AttributesTab({ productId }: { productId: string }) {
  const queryClient = useQueryClient()

  // State for the "add new attribute line" form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAttrId, setNewAttrId]     = useState('')
  const [newValueIds, setNewValueIds] = useState<string[]>([])

  // State for "expand value picker on existing line" (Update)
  const [expandingLine, setExpandingLine] = useState<string | null>(null)
  const [addValueIds, setAddValueIds]     = useState<string[]>([])

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: linesData, isLoading } = useQuery({
    queryKey: inventoryKeys.attributeLines(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductTemplateAttributeLine>>(
        '/inventory/product-attribute-lines/',
        { params: { template: productId, page_size: 50 } },
      ),
    staleTime: 60_000,
  })

  const { data: attrsData } = useQuery({
    queryKey: inventoryKeys.attributes({ page_size: 200 }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductAttribute>>('/inventory/product-attributes/', {
        params: { page_size: 200, is_active: true },
      }),
    staleTime: 300_000,
  })

  const lines        = linesData?.data.results ?? []
  const allAttrs     = attrsData?.data.results ?? []
  const usedAttrIds  = new Set(lines.map((l) => l.attribute))
  const availableAttrs = allAttrs.filter((a) => !usedAttrIds.has(a.id))
  const newAttr      = allAttrs.find((a) => a.id === newAttrId)

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: inventoryKeys.attributeLines(productId) })
    void queryClient.invalidateQueries({ queryKey: inventoryKeys.variants(productId) })
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  // CREATE — add new attribute line
  const addLineMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/inventory/product-attribute-lines/', {
        template:  productId,
        attribute: newAttrId,
        value_ids: newValueIds,
      }),
    onSuccess: () => {
      notify.success('Attribute added — variants updated')
      setShowAddForm(false); setNewAttrId(''); setNewValueIds([])
      invalidate()
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  // UPDATE — patch value_ids on an existing line
  const updateLineMutation = useMutation({
    mutationFn: ({ lineId, valueIds }: { lineId: string; valueIds: string[] }) =>
      apiClient.patch(`/inventory/product-attribute-lines/${lineId}/`, { value_ids: valueIds }),
    onSuccess: () => {
      notify.success('Values updated')
      setExpandingLine(null); setAddValueIds([])
      invalidate()
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  // DELETE — remove an attribute line
  const deleteLineMutation = useMutation({
    mutationFn: (lineId: string) =>
      apiClient.delete(`/inventory/product-attribute-lines/${lineId}/`),
    onSuccess: () => { notify.success('Attribute removed'); invalidate() },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  function removeValue(line: ProductTemplateAttributeLine, valueId: string) {
    const remaining = line.values.filter((v) => v.id !== valueId).map((v) => v.id)
    updateLineMutation.mutate({ lineId: line.id, valueIds: remaining })
  }

  function confirmAddValues(line: ProductTemplateAttributeLine) {
    const merged = [...new Set([...line.values.map((v) => v.id), ...addValueIds])]
    updateLineMutation.mutate({ lineId: line.id, valueIds: merged })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spin /></div>

  return (
    <div className="w-full space-y-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">
            Attributes set to <span className="font-medium">Always</span> regenerate variants
            on save — removed combinations are archived, never deleted.
            {lines.length > 0 && (
              <span className="ml-1 text-neutral-400">
                ({lines.length} attribute{lines.length !== 1 ? 's' : ''} configured)
              </span>
            )}
          </p>
          <a
            href="/inventory/attributes"
            className="text-xs text-brand-600 hover:underline"
          >
            Manage global attributes →
          </a>
        </div>
        {!showAddForm && availableAttrs.length > 0 && (
          <Button size="small"             icon={<Plus className="size-4" />}
            onClick={() => setShowAddForm(true)}
          >
            Add Attribute
          </Button>
        )}
      </div>

      {/* ── Existing attribute lines (READ + UPDATE + DELETE) ── */}
      {lines.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
          {lines.map((line) => {
            const lineAttr   = allAttrs.find((a) => a.id === line.attribute)
            const isExpanded = expandingLine === line.id
            // Values NOT yet on this line — available to add
            const addableValues = lineAttr?.values.filter(
              (v) => !line.values.some((lv) => lv.id === v.id),
            ) ?? []

            return (
              <div key={line.id}>
                {/* Row */}
                <div className="flex items-start gap-3 px-5 py-4">
                  {/* Attribute name */}
                  <div className="w-32 shrink-0 pt-0.5">
                    <p className="text-sm font-semibold text-neutral-800">{line.attribute_name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {line.values.length} value{line.values.length !== 1 ? 's' : ''}
                    </p>
                    {lineAttr && (
                      <Tag
                        className="mt-1 capitalize"
                        color={
                          lineAttr.create_variant === 'always'
                            ? 'processing'
                            : lineAttr.create_variant === 'dynamic'
                              ? 'warning'
                              : 'default'
                        }
                        title={
                          lineAttr.create_variant === 'always'
                            ? 'Variants are auto-created for every combination'
                            : lineAttr.create_variant === 'dynamic'
                              ? 'Variants are created on demand, not automatically'
                              : 'Informational only — never creates variants'
                        }
                      >
                        {lineAttr.create_variant}
                      </Tag>
                    )}
                  </div>

                  {/* Value chips — click ✕ to remove */}
                  <div className="flex-1 flex flex-wrap gap-1.5 pt-0.5">
                    {line.values.map((v) => (
                      <span
                        key={v.id}
                        className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700"
                      >
                        {v.color_code && (
                          <span className="size-2.5 rounded-full border border-white shadow-sm"
                            style={{ background: v.color_code }} />
                        )}
                        {v.name}
                        <button
                          type="button"
                          title={`Remove ${v.name}`}
                          disabled={updateLineMutation.isPending}
                          onClick={() => removeValue(line, v.id)}
                          className="text-neutral-300 hover:text-danger-500 transition-colors ml-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}

                    {/* Add more values button */}
                    {addableValues.length > 0 && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => { setExpandingLine(line.id); setAddValueIds([]) }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-neutral-300 text-xs text-neutral-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                      >
                        <Plus className="size-3" /> Add values
                      </button>
                    )}
                  </div>

                  {/* Delete line */}
                  <button
                    type="button"
                    title="Remove this attribute"
                    disabled={deleteLineMutation.isPending}
                    onClick={() => deleteLineMutation.mutate(line.id)}
                    className="shrink-0 p-1.5 rounded text-neutral-300 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Expandable value picker (Update) */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-neutral-50 border-t border-neutral-100">
                    <p className="text-xs font-medium text-neutral-500 mt-3 mb-2">
                      Select additional values:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {addableValues.map((v) => {
                        const sel = addValueIds.includes(v.id)
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() =>
                              setAddValueIds((prev) =>
                                sel ? prev.filter((id) => id !== v.id) : [...prev, v.id],
                              )
                            }
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                              sel
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300',
                            )}
                          >
                            {v.color_code && (
                              <span className="size-2.5 rounded-full border border-white/50"
                                style={{ background: v.color_code }} />
                            )}
                            {sel && <Check className="size-3" />}
                            {v.name}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        disabled={addValueIds.length === 0}
                        loading={updateLineMutation.isPending}
                        onClick={() => confirmAddValues(line)}
                      >
                        Save
                      </Button>
                      <Button size="small" type="text"
                        onClick={() => { setExpandingLine(null); setAddValueIds([]) }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {lines.length === 0 && !showAddForm && (
        <div className="bg-white border border-neutral-200 rounded-xl flex flex-col items-center justify-center py-16 text-neutral-400">
          <Sliders className="size-8 mb-2" />
          <p className="text-sm font-medium">No attributes configured</p>
          <p className="text-xs mt-1">Add attributes to generate product variants automatically</p>
          {availableAttrs.length > 0 && (
            <Button size="small"  className="mt-4"
              icon={<Plus className="size-4" />}
              onClick={() => setShowAddForm(true)}
            >
              Add First Attribute
            </Button>
          )}
        </div>
      )}

      {/* ── Add new attribute line form (Create) ── */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-800">Add Attribute</p>
            <button onClick={() => { setShowAddForm(false); setNewAttrId(''); setNewValueIds([]) }}
              className="text-blue-300 hover:text-blue-600">
              <X className="size-4" />
            </button>
          </div>

          {/* Attribute selector */}
          <div className="max-w-xs">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Attribute</label>
              <Select
                showSearch
                optionFilterProp="label"
                className="w-full"
                options={availableAttrs.map((a) => ({ value: a.id, label: a.name }))}
                value={newAttrId || undefined}
                onChange={(v) => {
                  setNewAttrId(v)
                  setNewValueIds([])
                }}
                placeholder="Select attribute…"
              />
            </div>
          </div>

          {/* Value picker (shows once an attribute is chosen) */}
          {newAttr && (
            <div>
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                Values <span className="font-normal normal-case text-blue-400">(select one or more)</span>
              </label>
              {newAttr.values.length === 0 ? (
                <p className="text-sm text-blue-400 italic">
                  This attribute has no values yet. Go to the global Attributes page to add values first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {newAttr.values.map((v) => {
                    const sel = newValueIds.includes(v.id)
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setNewValueIds((prev) =>
                            sel ? prev.filter((id) => id !== v.id) : [...prev, v.id],
                          )
                        }
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                          sel
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300',
                        )}
                      >
                        {v.color_code && (
                          <span className="size-2.5 rounded-full border border-white/50"
                            style={{ background: v.color_code }} />
                        )}
                        {sel && <Check className="size-3" />}
                        {v.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="small"
              disabled={!newAttrId || newValueIds.length === 0}
              loading={addLineMutation.isPending}
              onClick={() => addLineMutation.mutate()}
            >
              Add Attribute
            </Button>
            <Button size="small" type="text"
              onClick={() => { setShowAddForm(false); setNewAttrId(''); setNewValueIds([]) }}
            >
              Cancel
            </Button>
            {newValueIds.length > 0 && (
              <span className="text-xs text-blue-500 ml-1">
                {newValueIds.length} value{newValueIds.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Variants Tab ──────────────────────────────────────────────────────────────

const addVariantSchema = z.object({
  combination_name:  z.string().min(1, 'Name is required'),
  internal_ref:      z.string().optional(),
  barcode:           z.string().optional(),
  sales_price_extra: z.coerce.number().min(0),
})
type AddVariantForm = z.infer<typeof addVariantSchema>

type EditableField = 'internal_ref' | 'barcode' | 'sales_price_extra'

function EditableCell({
  value,
  isEditing,
  onStartEdit,
  onBlur,
  placeholder = '—',
  mono = false,
  align = 'left' as 'left' | 'right',
  formatDisplay,
}: {
  value: string
  isEditing: boolean
  onStartEdit: () => void
  onBlur: (value: string) => void
  placeholder?: string
  mono?: boolean
  align?: 'left' | 'right'
  formatDisplay?: (value: string) => string
}) {
  const display = formatDisplay ? formatDisplay(value) : (value || placeholder)

  if (isEditing) {
    return (
      <td className={cn('px-4 py-2', align === 'right' && 'text-right')}>
        <input
          autoFocus
          defaultValue={value}
          onBlur={(e) => onBlur(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') {
              ;(e.target as HTMLInputElement).value = value
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          className={cn(
            'w-full px-2 py-1 text-sm border border-brand-400 rounded focus:outline-none focus:ring-1 focus:ring-brand-400',
            mono && 'font-mono',
            align === 'right' && 'text-right',
          )}
        />
      </td>
    )
  }

  return (
    <td
      className={cn(
        'px-4 py-3 cursor-pointer hover:bg-brand-50 transition-colors',
        mono && 'font-mono text-xs',
        align === 'right' && 'text-right tabular-nums',
        !value && 'text-neutral-400',
      )}
      onClick={onStartEdit}
      title="Click to edit"
    >
      {display}
    </td>
  )
}

export function VariantsTab({
  productId,
  onSwitchToAttributes,
}: {
  productId: string
  onSwitchToAttributes: () => void
}) {
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<{
    variantId: string
    field: EditableField
  } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active')

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.variants(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductVariant>>('/inventory/product-variants/', {
        params: { template: productId, page_size: 200 },
      }),
    staleTime: 60_000,
  })

  const allVariants = data?.data.results ?? []
  const archivedCount = allVariants.filter((v) => !v.is_active).length
  const variants = allVariants.filter((v) => {
    if (statusFilter === 'active')   return v.is_active
    if (statusFilter === 'archived') return !v.is_active
    return true
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: inventoryKeys.variants(productId) })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      apiClient.patch(`/inventory/product-variants/${id}/`, patch),
    onSuccess: () => { notify.success('Variant updated'); invalidate() },
    onError:   (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/product-variants/${id}/`),
    onSuccess: () => { notify.success('Variant deleted'); invalidate() },
    onError:   (err) => notify.error(extractErrorMessage(err)),
  })

  const addMutation = useMutation({
    mutationFn: (values: AddVariantForm) =>
      apiClient.post('/inventory/product-variants/', { template: productId, ...values }),
    onSuccess: () => {
      notify.success('Variant added')
      setShowAddForm(false)
      invalidate()
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  function handleCellBlur(variantId: string, field: EditableField, value: string) {
    setEditingCell(null)
    updateMutation.mutate({ id: variantId, patch: { [field]: value } })
  }

  function handleDelete(v: ProductVariant) {
    if (!window.confirm(`Delete "${v.combination_name || 'this variant'}"? This cannot be undone.`)) return
    deleteMutation.mutate(v.id)
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spin /></div>

  return (
    <div className="space-y-4">
      {/* Info callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <Layers className="size-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Variants are generated, archived, and restored automatically from the{' '}
          <button type="button" onClick={onSwitchToAttributes} className="underline font-medium">
            Attributes tab
          </button>
          . Only attributes set to <span className="font-medium">Always</span> create variants.
          Click any SKU, barcode, or price cell below to edit inline.
        </p>
      </div>

      {/* Status filter pills */}
      {allVariants.length > 0 && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Filter variants by status">
          {(['active', 'archived', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize',
                statusFilter === f
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400',
              )}
              aria-pressed={statusFilter === f}
            >
              {f}
              {f === 'archived' && archivedCount > 0 && ` (${archivedCount})`}
            </button>
          ))}
        </div>
      )}

      {/* Variants table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {variants.length === 0 ? (
          allVariants.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
              <p className="text-sm">No {statusFilter} variants</p>
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Layers className="size-8 mb-2" />
            <p className="text-sm font-medium">No variants yet</p>
            <p className="text-xs mt-1">
              Add attributes in the{' '}
              <button
                type="button"
                onClick={onSwitchToAttributes}
                className="underline text-brand-600"
              >
                Attributes tab
              </button>
              {' '}to auto-generate variants, or add one manually below.
            </p>
          </div>
          )
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">Variant</th>
                <th className="text-left px-4 py-2.5 font-medium">SKU</th>
                <th className="text-left px-4 py-2.5 font-medium">Barcode</th>
                <th className="text-right px-4 py-2.5 font-medium">Price Extra</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {variants.map((v) => (
                <tr
                  key={v.id}
                  className={cn(
                    'hover:bg-neutral-50',
                    !v.is_active && 'opacity-50',
                  )}
                >
                  <td className="px-5 py-3">
                    {v.attribute_values.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {v.attribute_values.map((av) => (
                          <span
                            key={av.id}
                            title={av.attribute_name}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full"
                          >
                            {av.value_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-medium text-neutral-800">
                        {v.combination_name || '—'}
                      </span>
                    )}
                  </td>

                  <EditableCell
                    value={v.internal_ref ?? ''}
                    isEditing={editingCell?.variantId === v.id && editingCell?.field === 'internal_ref'}
                    onStartEdit={() => setEditingCell({ variantId: v.id, field: 'internal_ref' })}
                    onBlur={(val) => handleCellBlur(v.id, 'internal_ref', val)}
                    placeholder="—"
                    mono
                  />

                  <EditableCell
                    value={v.barcode ?? ''}
                    isEditing={editingCell?.variantId === v.id && editingCell?.field === 'barcode'}
                    onStartEdit={() => setEditingCell({ variantId: v.id, field: 'barcode' })}
                    onBlur={(val) => handleCellBlur(v.id, 'barcode', val)}
                    placeholder="—"
                    mono
                  />

                  <EditableCell
                    value={v.sales_price_extra ?? '0.00'}
                    isEditing={editingCell?.variantId === v.id && editingCell?.field === 'sales_price_extra'}
                    onStartEdit={() => setEditingCell({ variantId: v.id, field: 'sales_price_extra' })}
                    onBlur={(val) => handleCellBlur(v.id, 'sales_price_extra', val)}
                    align="right"
                    formatDisplay={(val) => {
                      const n = parseFloat(val)
                      if (isNaN(n) || n === 0) return '—'
                      return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
                    }}
                  />

                  <td className="px-4 py-3">
                    <Tag color={v.is_active ? 'success' : 'default'}>
                      {v.is_active ? 'Active' : 'Archived'}
                    </Tag>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {v.is_active ? (
                        <button
                          type="button"
                          onClick={() => updateMutation.mutate({ id: v.id, patch: { is_active: false } })}
                          className="text-xs text-neutral-400 hover:text-warning-600 px-2 py-1 rounded hover:bg-warning-50 transition-colors"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateMutation.mutate({ id: v.id, patch: { is_active: true } })}
                          className="text-xs text-neutral-400 hover:text-success-600 px-2 py-1 rounded hover:bg-success-50 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        disabled={deleteMutation.isPending}
                        className="text-neutral-300 hover:text-danger-600 p-1 rounded transition-colors"
                        aria-label={`Delete variant ${v.combination_name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Add Variant Manually */}
      <div className="border border-dashed border-neutral-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Plus className="size-4" />
          Add variant manually
        </button>

        {showAddForm && (
          <div className="px-4 pb-4 pt-2 border-t border-neutral-100">
            <ProForm<AddVariantForm>
              initialValues={{ sales_price_extra: 0 }}
              submitter={{
                searchConfig: { submitText: 'Add Variant' },
                submitButtonProps: { size: 'small', loading: addMutation.isPending },
                resetButtonProps: { style: { display: 'none' } },
              }}
              onFinish={async (values) => {
                await addMutation.mutateAsync(values)
                return true
              }}
            >
              <ProFormText name="combination_name" label="Variant Name" rules={[{ required: true }]} colProps={{ span: 12 }} />
              <ProFormText name="internal_ref" label="SKU" colProps={{ span: 12 }} />
              <ProFormText name="barcode" label="Barcode" colProps={{ span: 12 }} />
              <ProFormDigit name="sales_price_extra" label="Price Extra" min={0} fieldProps={{ step: 0.01 }} colProps={{ span: 12 }} />
            </ProForm>
            <Button type="text" size="small" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Images Tab ────────────────────────────────────────────────────────────────

export function ImagesTab({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.images(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductImage>>('/inventory/product-images/', {
        params: { template: productId, page_size: 50 },
      }),
    staleTime: 60_000,
  })

  const addMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/inventory/product-images/', {
        template: productId,
        url:      urlInput,
        alt_text: altInput || '',
        is_main:  (data?.data.results ?? []).length === 0,
      }),
    onSuccess: () => {
      notify.success('Image added')
      setUrlInput('')
      setAltInput('')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.images(productId) })
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/product-images/${id}/`),
    onSuccess: () => {
      notify.success('Image removed')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.images(productId) })
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const setMainMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(`/inventory/product-images/${id}/`, { is_main: true }),
    onSuccess: () => {
      notify.success('Main image updated')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.images(productId) })
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.product(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const images = data?.data.results ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Spin /></div>

  return (
    <div className="space-y-4">
      {/* Add image by URL */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-neutral-700">Add Image by URL</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
            <Input
              placeholder="https://…"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Alt Text</label>
            <Input
              placeholder="e.g. Product front view"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="small"
          onClick={() => addMutation.mutate()}
          disabled={!urlInput}
          loading={addMutation.isPending}
          icon={<Plus className="size-4" />}
        >
          Add Image
        </Button>
      </div>

      {/* Image gallery */}
      {images.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg flex flex-col items-center justify-center py-16 text-neutral-400">
          <ImageIcon className="size-8 mb-2" />
          <p className="text-sm">No images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                'relative group bg-neutral-100 rounded-lg overflow-hidden border-2 transition-colors',
                img.is_main ? 'border-brand-500' : 'border-transparent',
              )}
            >
              <img
                src={img.url}
                alt={img.alt_text || 'Product image'}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e5e7eb" width="100" height="100"/></svg>'
                }}
              />
              {img.is_main && (
                <div className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-xs px-2 py-0.5 rounded font-medium">
                  Main
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!img.is_main && (
                  <button
                    onClick={() => setMainMutation.mutate(img.id)}
                    className="bg-white text-neutral-700 text-xs px-2 py-1 rounded font-medium hover:bg-brand-600 hover:text-white transition-colors"
                  >
                    Set Main
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(img.id)}
                  className="bg-white text-danger-600 text-xs px-2 py-1 rounded font-medium hover:bg-danger-600 hover:text-white transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Suppliers Tab ─────────────────────────────────────────────────────────────

export function SuppliersTab({ productId }: { productId: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.suppliers(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductSupplierInfo>>('/inventory/product-supplier-info/', {
        params: { template: productId, page_size: 100 },
      }),
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/product-supplier-info/${id}/`),
    onSuccess: () => {
      notify.success('Supplier price removed')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.suppliers(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const suppliers = data?.data.results ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Spin /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Users className="size-8 mb-2" />
            <p className="text-sm">No supplier prices configured</p>
            <p className="text-xs mt-1">Add supplier pricelines to enable automatic purchase price lookup</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">Supplier</th>
                <th className="text-right px-4 py-2.5 font-medium">Min Qty</th>
                <th className="text-right px-4 py-2.5 font-medium">Price</th>
                <th className="text-right px-4 py-2.5 font-medium">Lead Time</th>
                <th className="text-left px-4 py-2.5 font-medium">Valid</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-neutral-800">{s.partner_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{parseFloat(s.min_qty).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {parseFloat(s.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {s.delay} {s.delay === 1 ? 'day' : 'days'}
                  </td>
                  <td className="px-4 py-3">
                    <Tag color={s.is_valid_today ? 'success' : 'default'}>
                      {s.is_valid_today ? 'Active' : 'Expired'}
                    </Tag>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => deleteMutation.mutate(s.id)}
                      loading={deleteMutation.isPending}
                      aria-label="Remove supplier price"
                    >
                      <Trash2 className="size-3.5 text-neutral-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}

// ── Barcodes Tab ──────────────────────────────────────────────────────────────

export function BarcodesTab({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const [newBarcode, setNewBarcode] = useState('')
  const [newVariant, setNewVariant] = useState('')

  const { data: variantsData } = useQuery({
    queryKey: inventoryKeys.variants(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductVariant>>('/inventory/product-variants/', {
        params: { template: productId, page_size: 100 },
      }),
    staleTime: 60_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.barcodes(productId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductBarcode>>('/inventory/product-barcodes/', {
        params: { variant__template: productId, page_size: 200 },
      }),
    staleTime: 60_000,
  })

  const variantOptions = (variantsData?.data.results ?? []).map((v) => ({
    value: v.id,
    label: v.combination_name,
  }))

  const variantMap: Record<string, string> = {}
  for (const v of variantsData?.data.results ?? []) variantMap[v.id] = v.combination_name

  const addMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/inventory/product-barcodes/', {
        variant: newVariant || variantsData?.data.results[0]?.id,
        barcode: newBarcode,
      }),
    onSuccess: () => {
      notify.success('Barcode added')
      setNewBarcode('')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.barcodes(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/product-barcodes/${id}/`),
    onSuccess: () => {
      notify.success('Barcode removed')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.barcodes(productId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const barcodes = data?.data.results ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Spin /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <p className="text-sm font-medium text-neutral-700 mb-3">Add Barcode</p>
        <div className="flex gap-2">
          {variantOptions.length > 1 && (
            <div className="w-48">
              <Select
                options={variantOptions}
                value={newVariant || variantOptions[0]?.value}
                onChange={setNewVariant}
              />
            </div>
          )}
          <Input
            placeholder="Scan or type barcode…"
            value={newBarcode}
            onChange={(e) => setNewBarcode(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newBarcode) {
                e.preventDefault()
                addMutation.mutate()
              }
            }}
          />
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!newBarcode}
            loading={addMutation.isPending}
            icon={<Plus className="size-4" />}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {barcodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <TagIcon className="size-8 mb-2" />
            <p className="text-sm">No barcodes configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">Barcode</th>
                <th className="text-left px-4 py-2.5 font-medium">Variant</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {barcodes.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-mono text-neutral-800">{b.barcode}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {b.variant ? (variantMap[b.variant] ?? b.variant.slice(0, 8) + '…') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Tag>{b.barcode_type_display}</Tag>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => deleteMutation.mutate(b.id)}
                      aria-label="Remove barcode"
                    >
                      <Trash2 className="size-3.5 text-neutral-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
