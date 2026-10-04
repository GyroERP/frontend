import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalForm, ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components'
import { z } from 'zod'
import { Plus, Sliders, X, ChevronRight, ChevronDown } from 'lucide-react'
import { notify } from '@/lib/notify'
import { apiClient, extractErrorMessage } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { Button, Input, Spin, Tag } from 'antd'
import type { ProductAttribute, ProductAttributeValue, DisplayType, CreateVariantMode } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

// ── Schemas ───────────────────────────────────────────────────────────────────

const attrSchema = z.object({
  name:           z.string().min(1, 'Name is required'),
  display_type:   z.enum(['radio', 'select', 'color', 'pills']),
  create_variant: z.enum(['always', 'dynamic', 'never']),
})
type AttrForm = z.infer<typeof attrSchema>

const valueSchema = z.object({
  name:       z.string().min(1, 'Name is required'),
  color_code: z.string().optional(),
})
type ValueForm = z.infer<typeof valueSchema>

// ── Options ───────────────────────────────────────────────────────────────────

const DISPLAY_TYPE_OPTIONS: { value: DisplayType; label: string }[] = [
  { value: 'radio',  label: 'Radio buttons' },
  { value: 'select', label: 'Dropdown select' },
  { value: 'pills',  label: 'Pills' },
  { value: 'color',  label: 'Color swatches' },
]

const VARIANT_MODE_OPTIONS: { value: CreateVariantMode; label: string; desc: string }[] = [
  { value: 'always',  label: 'Always',  desc: 'Create all combinations immediately' },
  { value: 'dynamic', label: 'Dynamic', desc: 'Create on first sale/purchase' },
  { value: 'never',   label: 'Never',   desc: 'No variants — attribute is informational' },
]

// ── Create Attribute Modal ────────────────────────────────────────────────────

function CreateAttributeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(true)

  const createMutation = useMutation({
    mutationFn: (values: AttrForm) =>
      apiClient.post('/inventory/product-attributes/', values),
    onSuccess: () => {
      notify.success('Attribute created')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.attributes() })
      setOpen(false)
      onClose()
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  return (
    <ModalForm<AttrForm>
      title="New Attribute"
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) onClose()
      }}
      initialValues={{ display_type: 'pills', create_variant: 'always' }}
      modalProps={{ destroyOnClose: true }}
      onFinish={async (values) => {
        await createMutation.mutateAsync(values)
        return true
      }}
    >
      <ProFormText name="name" label="Attribute Name" rules={[{ required: true }]} />
      <ProFormRadio.Group
        name="display_type"
        label="Display Type"
        options={DISPLAY_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
      />
      <ProFormRadio.Group
        name="create_variant"
        label="Variant Creation"
        options={VARIANT_MODE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
      />
    </ModalForm>
  )
}

// ── Add Value inline form ─────────────────────────────────────────────────────

function AddValueForm({
  attributeId,
  onDone,
}: {
  attributeId: string
  onDone: () => void
}) {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (values: ValueForm) =>
      apiClient.post('/inventory/product-attribute-values/', {
        attribute: attributeId,
        name: values.name,
        color_code: values.color_code || '',
      }),
    onSuccess: () => {
      notify.success('Value added')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.attribute(attributeId) })
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.attributes() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  return (
    <ProForm<ValueForm>
      layout="inline"
      submitter={{
        searchConfig: { submitText: 'Add' },
        submitButtonProps: { size: 'small', loading: addMutation.isPending },
        resetButtonProps: { style: { display: 'none' } },
      }}
      onFinish={async (values) => {
        await addMutation.mutateAsync(values)
        onDone()
        return true
      }}
    >
      <ProFormText name="name" placeholder="Value name…" rules={[{ required: true }]} />
    </ProForm>
  )
}

// ── Attribute Row (expandable) ────────────────────────────────────────────────

function AttributeRow({ attr }: { attr: ProductAttribute }) {
  const [expanded, setExpanded] = useState(false)
  const [addingValue, setAddingValue] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (valueId: string) =>
      apiClient.delete(`/inventory/product-attribute-values/${valueId}/`),
    onSuccess: () => {
      notify.success('Value removed')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.attributes() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const VARIANT_MODE_LABELS: Record<CreateVariantMode, string> = {
    always:  'Always',
    dynamic: 'Dynamic',
    never:   'Never',
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded
          ? <ChevronDown className="size-4 text-neutral-400 shrink-0" />
          : <ChevronRight className="size-4 text-neutral-400 shrink-0" />
        }
        <Sliders className="size-4 text-neutral-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800">{attr.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {attr.values.length} {attr.values.length === 1 ? 'value' : 'values'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Tag className="capitalize">{attr.display_type}</Tag>
          <Tag color="processing">{VARIANT_MODE_LABELS[attr.create_variant]}</Tag>
          <Tag color={attr.is_active ? 'success' : 'default'}>
            {attr.is_active ? 'Active' : 'Archived'}
          </Tag>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Values</p>
            <Button
              size="small"
              icon={<Plus className="size-3.5" />}
              onClick={() => setAddingValue(true)}
            >
              Add Value
            </Button>
          </div>

          {attr.values.length === 0 && !addingValue ? (
            <p className="text-sm text-neutral-400 italic">No values yet — click "Add Value" to start.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attr.values.map((v) => (
                <ValueChip
                  key={v.id}
                  value={v}
                  onDelete={() => deleteMutation.mutate(v.id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}

          {addingValue && (
            <AddValueForm
              attributeId={attr.id}
              onDone={() => setAddingValue(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ValueChip({
  value,
  onDelete,
  isDeleting,
}: {
  value: ProductAttributeValue
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className="group flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full px-3 py-1 transition-colors">
      {value.color_code && (
        <span
          className="size-3 rounded-full border border-white shadow-sm shrink-0"
          style={{ background: value.color_code }}
        />
      )}
      <span className="text-xs font-medium text-neutral-700">{value.name}</span>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="text-neutral-400 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove value ${value.name}`}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AttributesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: inventoryKeys.attributes({ search: search || undefined }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductAttribute>>('/inventory/product-attributes/', {
        params: { search: search || undefined, page_size: 100 },
      }),
    staleTime: 60_000,
  })

  const attributes = data?.data.results ?? []
  const filtered = search
    ? attributes.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : attributes

  return (
    <>
      <PageShell
        title="Product Attributes"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Attributes' }]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setShowCreate(true)}
          >
            New Attribute
          </Button>
        }
      >
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="mb-4">
            <Input
              placeholder="Search attributes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spin /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <Sliders className="size-10 mb-3" />
              <p className="text-sm font-medium">No attributes found</p>
              <p className="text-xs mt-1">
                {search ? 'Try a different search term.' : 'Create attributes to define product variants (Color, Size, etc.)'}
              </p>
              {!search && (
                <Button
                  size="small"
                  className="mt-4"
                  onClick={() => setShowCreate(true)}
                >
                  Create First Attribute
                </Button>
              )}
            </div>
          ) : (
            filtered.map((attr) => <AttributeRow key={attr.id} attr={attr} />)
          )}
        </div>
      </PageShell>

      {showCreate && <CreateAttributeModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
