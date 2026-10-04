import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import {
  EditableProTable,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { notify } from '@/lib/notify'
import { apiClient, extractErrorMessage } from '@/api/client'
import { inventoryKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { Button } from 'antd'
import type { OperationType, StockPicking, ProductVariant } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'
import { useMemo, useState } from 'react'

type LineRow = { id: string; variant: string; product_qty: number }

export function TransferFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [lines, setLines] = useState<LineRow[]>([{ id: '1', variant: '', product_qty: 1 }])

  const { data: opTypesData } = useQuery({
    queryKey: inventoryKeys.operationTypes(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<OperationType>>('/inventory/operation-types/', {
        params: { page_size: 100, is_active: true },
      }),
    staleTime: 300_000,
  })

  const { data: variantsData } = useQuery({
    queryKey: ['inventory', 'variants-flat'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductVariant>>('/inventory/product-variants/', {
        params: { page_size: 500, is_active: true },
      }),
    staleTime: 120_000,
  })

  const opTypeOptions = (opTypesData?.data.results ?? []).map((op) => ({
    value: op.id,
    label: op.name,
  }))

  const variantOptions = (variantsData?.data.results ?? []).map((v) => ({
    value: v.id,
    label: v.combination_name + (v.internal_ref ? ` [${v.internal_ref}]` : ''),
  }))

  const lineColumns: ProColumns<LineRow>[] = useMemo(
    () => [
      {
        title: 'Product / Variant',
        dataIndex: 'variant',
        valueType: 'select',
        fieldProps: { options: variantOptions, showSearch: true },
        width: '60%',
      },
      {
        title: 'Quantity',
        dataIndex: 'product_qty',
        valueType: 'digit',
        fieldProps: { min: 0.001, step: 0.001 },
        width: 120,
      },
      {
        title: 'Actions',
        valueType: 'option',
        render: (_: unknown, row: LineRow) => [
          <Button
            key="delete"
            type="link"
            danger
            disabled={lines.length <= 1}
            onClick={() => setLines((prev) => prev.filter((l) => l.id !== row.id))}
          >
            Remove
          </Button>,
        ],
      },
    ],
    [variantOptions, lines.length],
  )

  const createMutation = useMutation({
    mutationFn: async (values: {
      picking_type: string
      partner?: string
      scheduled_date?: string
      origin?: string
      note?: string
    }) => {
      const validLines = lines.filter((l) => l.variant && l.product_qty > 0)
      if (validLines.length === 0) {
        throw new Error('Add at least one product line')
      }
      const pickingRes = await apiClient.post<StockPicking>('/inventory/transfers/', {
        picking_type: values.picking_type,
        partner: values.partner || undefined,
        scheduled_date: values.scheduled_date || undefined,
        origin: values.origin || undefined,
        note: values.note || undefined,
      })
      const pickingId = pickingRes.data.id
      await Promise.all(
        validLines.map((line) =>
          apiClient.post('/inventory/stock-moves/', {
            picking: pickingId,
            variant: line.variant,
            product_qty: line.product_qty,
          }),
        ),
      )
      return pickingId
    },
    onSuccess: (pickingId) => {
      notify.success('Transfer created')
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.pickings() })
      void navigate({ to: '/inventory/transfers/$id', params: { id: pickingId } })
    },
    onError: (err) => {
      notify.error(extractErrorMessage(err))
    },
  })

  return (
    <PageShell
      title="New Transfer"
      breadcrumbs={[
        { label: 'Inventory', href: '/inventory' },
        { label: 'Transfers', href: '/inventory/transfers' },
        { label: 'New Transfer' },
      ]}
      actions={
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate({ to: '/inventory/transfers' })}
        >
          Back
        </Button>
      }
    >
      <ProForm
        className="mx-auto max-w-3xl"
        submitter={{
          searchConfig: { submitText: 'Create Transfer' },
          submitButtonProps: { loading: createMutation.isPending },
          resetButtonProps: { style: { display: 'none' } },
        }}
        onFinish={async (values) => {
          await createMutation.mutateAsync(values as Parameters<typeof createMutation.mutateAsync>[0])
          return true
        }}
      >
        <ProForm.Group title="Transfer Details">
          <ProFormSelect
            name="picking_type"
            label="Operation Type"
            rules={[{ required: true }]}
            options={opTypeOptions}
            showSearch
            colProps={{ span: 24 }}
          />
          <ProFormText name="origin" label="Origin Reference" placeholder="e.g. PO/2025/001" colProps={{ span: 12 }} />
          <ProFormText name="scheduled_date" label="Scheduled Date" fieldProps={{ type: 'datetime-local' }} colProps={{ span: 12 }} />
          <ProFormTextArea name="note" label="Notes" colProps={{ span: 24 }} />
        </ProForm.Group>

        <EditableProTable<LineRow>
          headerTitle="Product lines"
          rowKey="id"
          columns={lineColumns}
          value={lines}
          onChange={(value) => setLines([...value])}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ id: `line-${Date.now()}`, variant: '', product_qty: 1 }),
            creatorButtonText: 'Add line',
            icon: <PlusOutlined />,
          }}
          editable={{
            type: 'multiple',
            editableKeys: lines.map((l) => l.id),
            onValuesChange: (_, recordList) => setLines(recordList),
          }}
          search={false}
          options={false}
          pagination={false}
        />
      </ProForm>
    </PageShell>
  )
}
