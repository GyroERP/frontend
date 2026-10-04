import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { ProDescriptions, ProForm, ProFormText } from '@ant-design/pro-components'
import { CustomerSelector } from '@/erp/selectors/PartnerSelector'
import { GyroLogger } from '@/erp/enterprise/GyroLogger'
import { PermissionGuard } from '@/erp/enterprise/PermissionGuard'
import { PERMISSIONS } from '@/config/permissions'
import { notify } from '@/lib/notify'
import { salesApi } from '../api/endpoints'
import { salesKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { SalesOrderLinesTable } from '@/erp/document/SalesOrderLinesTable'
import { Button, Skeleton } from 'antd'
import { StateBadge } from '@/erp/display/StateBadge'
import { WorkflowStatusBar } from '@/erp/enterprise/WorkflowStatusBar'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { SequenceDisplay } from '@/erp/display/SequenceDisplay'
import { extractErrorMessage } from '@/api/client'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import type { SalesOrder, SalesOrderLine } from '../api/types'

const ORDER_STATES = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SENT', label: 'Sent' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SALE', label: 'Confirmed' },
  { key: 'DONE', label: 'Done' },
]

interface OrderDetailPageProps {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = orderId === 'new'
  const currencyCode = useCurrencyCode()

  const { data, isLoading } = useQuery({
    queryKey: salesKeys.order(orderId),
    queryFn: () => salesApi.orders.get(orderId),
    enabled: !isNew,
    staleTime: 30_000,
  })

  const { data: linesData } = useQuery({
    queryKey: salesKeys.orderLines(orderId),
    queryFn: () => salesApi.orderLines.list({ order: orderId }),
    enabled: !isNew,
    staleTime: 30_000,
  })

  const order: SalesOrder | undefined = data?.data
  const lines: SalesOrderLine[] = linesData?.data.results ?? []

  const isDraft = !order || order.state === 'DRAFT'

  const confirm = useMutation({
    mutationFn: () => salesApi.orders.confirm(orderId),
    onSuccess: () => {
      notify.success('Order confirmed')
      void queryClient.invalidateQueries({ queryKey: salesKeys.orders() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const createOrder = useMutation({
    mutationFn: (d: { partner: string; client_order_ref?: string }) => salesApi.orders.create(d),
    onSuccess: (res) => {
      notify.success('Order created')
      void navigate({ to: '/sales/orders/$id', params: { id: res.data.id } })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const cancel = useMutation({
    mutationFn: () => salesApi.orders.cancel(orderId),
    onSuccess: () => {
      notify.success('Order cancelled')
      void queryClient.invalidateQueries({ queryKey: salesKeys.orders() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const addLine = useMutation({
    mutationFn: (d: {
      variant: string
      description?: string
      product_qty: number
      price_unit: number
    }) =>
      salesApi.orderLines.create({
        order: orderId,
        variant: d.variant,
        description: d.description,
        product_qty: String(d.product_qty),
        price_unit: String(d.price_unit),
      }),
    onSuccess: () => {
      notify.success('Line added')
      void queryClient.invalidateQueries({ queryKey: salesKeys.orderLines(orderId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteLine = useMutation({
    mutationFn: (lineId: string) => salesApi.orderLines.delete(lineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesKeys.orderLines(orderId) })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  if (isNew) {
    return (
      <PageShell
        title="New Sales Order"
        breadcrumbs={[
          { label: 'Sales', href: '/sales' },
          { label: 'Orders', href: '/sales/orders' },
          { label: 'New' },
        ]}
      >
        <div className="max-w-lg">
          <ProForm
            onFinish={async (values) => {
              await createOrder.mutateAsync(values as { partner: string; client_order_ref?: string })
              return true
            }}
            submitter={{
              searchConfig: { submitText: 'Create Order' },
              submitButtonProps: { loading: createOrder.isPending },
            }}
          >
            <ProForm.Item name="partner" label="Customer" rules={[{ required: true }]}>
              <CustomerSelector value={null} onChange={() => undefined} />
            </ProForm.Item>
            <ProFormText name="client_order_ref" label="Customer Reference" />
          </ProForm>
        </div>
      </PageShell>
    )
  }

  if (!isNew && isLoading) {
    return (
      <PageShell title="…" breadcrumbs={[{ label: 'Sales', href: '/sales/orders' }, { label: '…' }]}>
        <div className="mx-auto space-y-4 max-w-4xl">
          <Skeleton active title={{ style: { width: 192, height: 32 } }} paragraph={false} />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} active style={{ width: '100%', height: 40 }} />
          ))}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={
        <span className="flex items-center gap-3">
          <SequenceDisplay value={order?.name ?? null} />
          {order?.state && <StateBadge state={order.state} />}
        </span>
      }
      breadcrumbs={[
        { label: 'Sales', href: '/sales' },
        { label: 'Orders', href: '/sales/orders' },
        { label: order?.name ?? 'Order' },
      ]}
      aside={<GyroLogger contentType="sales.salesorder" objectId={orderId} />}
      actions={
        <div className="flex items-center gap-2">
          <PermissionGuard model={PERMISSIONS.SALES_ORDER} action="write">
            {isDraft && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={confirm.isPending}
                onClick={() => confirm.mutate()}
              >
                Confirm
              </Button>
            )}
          </PermissionGuard>
          <PermissionGuard model={PERMISSIONS.SALES_ORDER} action="write">
            {order?.state === 'SALE' && (
              <Button
                type="text"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                loading={cancel.isPending}
                onClick={() => cancel.mutate()}
              >
                Cancel
              </Button>
            )}
          </PermissionGuard>
        </div>
      }
    >
      {!isNew && order && (
        <WorkflowStatusBar
          steps={ORDER_STATES}
          currentState={order.state}
          className="mb-6"
        />
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header info */}
        {order && (
          <ProDescriptions
            title="Order summary"
            column={3}
            dataSource={order}
            columns={[
              { title: 'Customer', dataIndex: 'partner_name' },
              {
                title: 'Order Date',
                dataIndex: 'date_order',
                render: (_, r) => (r.date_order ? formatDate(r.date_order) : '—'),
              },
              {
                title: 'Commitment Date',
                dataIndex: 'commitment_date',
                render: (_, r) => (r.commitment_date ? formatDate(r.commitment_date) : '—'),
              },
              {
                title: 'Amount (Untaxed)',
                dataIndex: 'amount_untaxed',
                render: (_, r) => (
                  <MoneyDisplay amount={r.amount_untaxed} currencyCode={currencyCode} />
                ),
              },
              {
                title: 'Tax',
                dataIndex: 'amount_tax',
                render: (_, r) => <MoneyDisplay amount={r.amount_tax} currencyCode={currencyCode} />,
              },
              {
                title: 'Total',
                dataIndex: 'amount_total',
                render: (_, r) => (
                  <MoneyDisplay amount={r.amount_total} currencyCode={currencyCode} size="lg" />
                ),
              },
            ]}
          />
        )}

        {!isNew && (
          <SalesOrderLinesTable
            lines={lines}
            currencyCode={currencyCode}
            isDraft={isDraft}
            adding={addLine.isPending}
            onDelete={(id) => deleteLine.mutate(id)}
            onAdd={async (values) => {
              await addLine.mutateAsync(values)
            }}
          />
        )}
      </div>
    </PageShell>
  )
}
