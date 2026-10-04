import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { purchaseKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { GyroLogger } from '@/erp/enterprise/GyroLogger'
import { PermissionGuard } from '@/erp/enterprise/PermissionGuard'
import { PERMISSIONS } from '@/config/permissions'
import { ProForm, ProFormText } from '@ant-design/pro-components'
import { SupplierSelector } from '@/erp/selectors/PartnerSelector'
import { notify } from '@/lib/notify'
import { extractErrorMessage } from '@/api/client'
import { PurchaseOrderLinesTable } from '@/erp/document/PurchaseOrderLinesTable'
import { Button, Modal } from 'antd'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import { apiClient } from '@/api/client'
import type { PurchaseOrder, PurchaseOrderLine } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

interface Props {
  orderId: string
}

const PO_TRANSITIONS: Record<string, { label: string; nextState: string; variant: 'primary' | 'secondary' | 'danger' }[]> = {
  DRAFT: [
    { label: 'Send to Supplier', nextState: 'SENT', variant: 'primary' },
    { label: 'Confirm', nextState: 'APPROVED', variant: 'secondary' },
  ],
  SENT: [
    { label: 'Confirm Order', nextState: 'APPROVED', variant: 'primary' },
    { label: 'Cancel', nextState: 'CANCELLED', variant: 'danger' },
  ],
  CONFIRMATION: [
    { label: 'Approve', nextState: 'APPROVED', variant: 'primary' },
    { label: 'Cancel', nextState: 'CANCELLED', variant: 'danger' },
  ],
  APPROVED: [
    { label: 'Mark as Received', nextState: 'RECEIVED', variant: 'primary' },
    { label: 'Cancel', nextState: 'CANCELLED', variant: 'danger' },
  ],
}

export function PODetailPage({ orderId }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currencyCode = useCurrencyCode()
  const [cancelOpen, setCancelOpen] = useState(false)
  const isNew = orderId === 'new'

  const { data: orderRes, isLoading } = useQuery({
    queryKey: purchaseKeys.order(orderId),
    queryFn: () => apiClient.get<PurchaseOrder>(`/purchase/orders/${orderId}/`),
    enabled: !isNew,
    staleTime: 60_000,
  })

  const { data: linesRes } = useQuery({
    queryKey: [...purchaseKeys.order(orderId), 'lines'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<PurchaseOrderLine>>(`/purchase/orders/${orderId}/lines/`),
    enabled: !isNew && !!orderId,
    staleTime: 30_000,
  })

  const createOrder = useMutation({
    mutationFn: (d: { partner: string; partner_ref?: string }) =>
      apiClient.post<PurchaseOrder>('/purchase/orders/', d),
    onSuccess: (res) => {
      notify.success('Purchase order created')
      void navigate({ to: '/purchase/orders/$id', params: { id: res.data.id } })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const transitionMutation = useMutation({
    mutationFn: (nextState: string) =>
      apiClient.post(`/purchase/orders/${orderId}/transition/`, { state: nextState }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.order(orderId) })
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/purchase/orders/${orderId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.orders() })
      navigate({ to: '/purchase/orders' })
    },
  })

  const order = orderRes?.data
  const lines = linesRes?.data.results ?? []

  if (isNew) {
    return (
      <PageShell
        title="New Purchase Order"
        breadcrumbs={[
          { label: 'Purchase', href: '/purchase' },
          { label: 'Orders', href: '/purchase/orders' },
          { label: 'New' },
        ]}
      >
        <div className="max-w-lg">
          <ProForm
            onFinish={async (values) => {
              await createOrder.mutateAsync(values as { partner: string; partner_ref?: string })
              return true
            }}
            submitter={{
              searchConfig: { submitText: 'Create PO' },
              submitButtonProps: { loading: createOrder.isPending },
            }}
          >
            <ProForm.Item name="partner" label="Vendor" rules={[{ required: true }]}>
              <SupplierSelector value={null} onChange={() => undefined} />
            </ProForm.Item>
            <ProFormText name="partner_ref" label="Vendor Reference" />
          </ProForm>
        </div>
      </PageShell>
    )
  }

  if (isLoading || !order) {
    return (
      <PageShell title="Purchase Order" breadcrumbs={[{ label: 'Purchase' }, { label: 'Orders', href: '/purchase/orders' }]}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 rounded w-48" />
          <div className="h-32 bg-neutral-100 rounded" />
        </div>
      </PageShell>
    )
  }

  const transitions = PO_TRANSITIONS[order.state] ?? []

  return (
    <PageShell
      title={
        <span className="flex items-center gap-3">
          <span className="font-mono">{order.name}</span>
          <StateBadge state={order.state} />
        </span>
      }
      breadcrumbs={[
        { label: 'Purchase', href: '/purchase' },
        { label: 'Orders', href: '/purchase/orders' },
        { label: order.name },
      ]}
      aside={<GyroLogger contentType="purchase.purchaseorder" objectId={orderId} />}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate({ to: '/purchase/orders' })}
          >
            Back
          </Button>
          <Button icon={<Printer className="size-4" />} type="text" onClick={() => window.print()}>
            Print
          </Button>
          {transitions.map((t) => (
            <PermissionGuard key={t.nextState} model={PERMISSIONS.PURCHASE_ORDER} action="write">
              {t.nextState === 'CANCELLED' ? (
                <Button type="primary" danger onClick={() => setCancelOpen(true)}>
                  {t.label}
                </Button>
              ) : (
                <Button
                  type={t.variant === 'primary' ? 'primary' : 'default'}
                  loading={transitionMutation.isPending}
                  onClick={() => transitionMutation.mutate(t.nextState)}
                >
                  {t.label}
                </Button>
              )}
            </PermissionGuard>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order info */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-base font-semibold text-neutral-800 mb-4">Order Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Supplier</dt>
                <dd className="mt-1 text-sm text-neutral-800">{order.partner_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Order Date</dt>
                <dd className="mt-1 text-sm text-neutral-800">{formatDate(order.date_order)}</dd>
              </div>
              {order.date_planned && (
                <div>
                  <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Expected Date</dt>
                  <dd className="mt-1 text-sm text-neutral-800">{formatDate(order.date_planned)}</dd>
                </div>
              )}
              {order.date_approve && (
                <div>
                  <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Approved Date</dt>
                  <dd className="mt-1 text-sm text-neutral-800">{formatDate(order.date_approve)}</dd>
                </div>
              )}
              {order.payment_term_name && (
                <div>
                  <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Payment Terms</dt>
                  <dd className="mt-1 text-sm text-neutral-800">{order.payment_term_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Currency</dt>
                <dd className="mt-1 text-sm text-neutral-800">{order.currency_code}</dd>
              </div>
            </dl>
          </div>

          <PurchaseOrderLinesTable lines={lines} currencyCode={currencyCode} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Order Summary</h3>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="font-medium text-neutral-800">
                  <MoneyDisplay amount={order.amount_untaxed} currencyCode={currencyCode} />
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-neutral-500">Taxes</dt>
                <dd className="font-medium text-neutral-800">
                  <MoneyDisplay amount={order.amount_tax} currencyCode={currencyCode} />
                </dd>
              </div>
              <div className="flex justify-between text-sm border-t border-neutral-200 pt-3">
                <dt className="font-semibold text-neutral-800">Total</dt>
                <dd className="font-bold text-brand-red text-base">
                  <MoneyDisplay amount={order.amount_total} currencyCode={currencyCode} />
                </dd>
              </div>
            </dl>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Status</h3>
            <StateBadge state={order.state} />
            <p className="mt-2 text-xs text-neutral-500">
              {order.line_count} line{order.line_count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Danger zone */}
          {order.state === 'DRAFT' && (
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Danger Zone</h3>
              <Button
                type="primary"
                danger
                size="small"
                block
                onClick={() => setCancelOpen(true)}
              >
                Delete Order
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        title="Cancel Purchase Order"
        okText="Cancel Order"
        okButtonProps={{ danger: true }}
        onCancel={() => setCancelOpen(false)}
        onOk={async () => {
          if (order.state === 'DRAFT') {
            await deleteMutation.mutateAsync()
          } else {
            await transitionMutation.mutateAsync('CANCELLED')
          }
          setCancelOpen(false)
        }}
      >
        Are you sure you want to cancel {order.name}? This action cannot be undone.
      </Modal>
    </PageShell>
  )
}
