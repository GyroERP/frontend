import { EditableProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Button, Modal } from 'antd'
import { ProForm, ProFormDigit, ProFormText } from '@ant-design/pro-components'
import { useState } from 'react'
import { ProductSelector } from '@/erp/selectors/ProductSelector'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import type { SalesOrderLineRow } from '@/erp/document/types'

interface AddLineValues {
  variant: string
  description?: string
  product_qty: number
  price_unit: number
}

interface SalesOrderLinesTableProps {
  lines: SalesOrderLineRow[]
  currencyCode: string
  isDraft: boolean
  onDelete: (lineId: string) => void
  onAdd: (values: AddLineValues) => Promise<void>
  adding?: boolean
}

export function SalesOrderLinesTable({
  lines,
  currencyCode,
  isDraft,
  onDelete,
  onAdd,
  adding,
}: SalesOrderLinesTableProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [variantId, setVariantId] = useState<string | null>(null)

  const columns: ProColumns<SalesOrderLineRow>[] = [
    { title: 'Product', dataIndex: 'variant_name', editable: false, width: 180 },
    {
      title: 'Description',
      dataIndex: 'description',
      editable: false,
      ellipsis: true,
    },
    { title: 'Qty', dataIndex: 'product_qty', valueType: 'digit', editable: false, align: 'right' },
    { title: 'Unit Price', dataIndex: 'price_unit', editable: false, align: 'right' },
    {
      title: 'Subtotal',
      dataIndex: 'price_subtotal',
      editable: false,
      align: 'right',
      render: (_, row) => (
        <MoneyDisplay amount={row.price_subtotal} currencyCode={currencyCode} />
      ),
    },
    ...(isDraft
      ? [
          {
            title: 'Actions',
            valueType: 'option' as const,
            width: 80,
            render: (_: unknown, row: SalesOrderLineRow) => [
              <Button
                key="delete"
                type="link"
                danger
                size="small"
                onClick={() => onDelete(row.id)}
              >
                Remove
              </Button>,
            ],
          },
        ]
      : []),
  ]

  return (
    <>
      <EditableProTable<SalesOrderLineRow>
        rowKey="id"
        columns={columns}
        value={lines}
        recordCreatorProps={false}
        editable={{ type: 'multiple', editableKeys: [] }}
        search={false}
        options={false}
        pagination={false}
        toolBarRender={
          isDraft
            ? () => [
                <Button key="add" type="primary" onClick={() => setAddOpen(true)}>
                  Add line
                </Button>,
              ]
            : false
        }
        locale={{ emptyText: 'No order lines yet.' }}
      />

      <Modal
        title="Add order line"
        open={addOpen}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setAddOpen(false)
          setVariantId(null)
        }}
      >
        <ProForm<AddLineValues>
          onFinish={async (values) => {
            if (!variantId) return false
            await onAdd({ ...values, variant: variantId })
            setAddOpen(false)
            setVariantId(null)
            return true
          }}
          submitter={{
            searchConfig: { submitText: 'Add' },
            submitButtonProps: { loading: adding },
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Product</label>
            <ProductSelector
              value={variantId}
              onChange={setVariantId}
              placeholder="Select product…"
            />
          </div>
          <ProFormText name="description" label="Description" />
          <ProFormDigit name="product_qty" label="Quantity" min={0.01} initialValue={1} rules={[{ required: true }]} />
          <ProFormDigit name="price_unit" label="Unit price" min={0} initialValue={0} rules={[{ required: true }]} />
        </ProForm>
      </Modal>
    </>
  )
}
