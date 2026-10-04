import { EditableProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import type { PurchaseOrderLineRow } from '@/erp/document/types'

interface PurchaseOrderLinesTableProps {
  lines: PurchaseOrderLineRow[]
  currencyCode: string
}

export function PurchaseOrderLinesTable({ lines, currencyCode }: PurchaseOrderLinesTableProps) {
  const columns: ProColumns<PurchaseOrderLineRow>[] = [
    {
      title: 'Product',
      dataIndex: 'variant_name',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.variant_name}</div>
          {row.name && row.name !== row.variant_name && (
            <div className="text-xs text-neutral-500">{row.name}</div>
          )}
        </div>
      ),
    },
    { title: 'Supplier Ref', dataIndex: 'supplier_code', render: (v) => v ?? '—' },
    { title: 'Qty', dataIndex: 'product_qty', align: 'right' },
    { title: 'UoM', dataIndex: 'product_uom_name' },
    {
      title: 'Unit Price',
      dataIndex: 'price_unit',
      align: 'right',
      render: (_, row) => <MoneyDisplay amount={row.price_unit} currencyCode={currencyCode} />,
    },
    { title: 'Received', dataIndex: 'qty_received', align: 'right' },
    { title: 'Invoiced', dataIndex: 'qty_invoiced', align: 'right' },
    {
      title: 'Subtotal',
      dataIndex: 'price_subtotal',
      align: 'right',
      render: (_, row) => <MoneyDisplay amount={row.price_subtotal} currencyCode={currencyCode} />,
    },
  ]

  return (
    <EditableProTable<PurchaseOrderLineRow>
      rowKey="id"
      headerTitle="Order lines"
      columns={columns}
      value={lines}
      recordCreatorProps={false}
      editable={{ type: 'multiple', editableKeys: [] }}
      search={false}
      options={false}
      pagination={false}
      locale={{ emptyText: 'No lines on this purchase order.' }}
    />
  )
}
