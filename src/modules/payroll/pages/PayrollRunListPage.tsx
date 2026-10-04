import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-components'
import { notify } from '@/lib/notify'
import { apiClient, extractErrorMessage } from '@/api/client'
import { PERMISSIONS } from '@/config/permissions'
import { payrollKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import type { ColumnsType } from 'antd/es/table'
import type { PayrollRun } from '../api/types'
import type { AxiosResponse } from 'axios'

export function PayrollRunListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const createRun = useMutation({
    mutationFn: (d: { name: string; period_from: string; period_to: string }) =>
      apiClient.post<PayrollRun>('/payroll/runs/', d),
    onSuccess: (res: AxiosResponse<PayrollRun>) => {
      notify.success('Payroll run created')
      void queryClient.invalidateQueries({ queryKey: payrollKeys.runs() })
      setCreateOpen(false)
      void navigate({ to: '/payroll/runs/$id', params: { id: res.data.id } })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })
  const currencyCode = useCurrencyCode()
  const controller = useListController<PayrollRun>({
    queryKey: (p) => payrollKeys.runList(p),
    url: '/payroll/runs/',
  })

  const columns: ColumnsType<PayrollRun> = [
    {
      title: 'Run',
      dataIndex: 'name',
      render: (name: string) => <span className="font-medium text-neutral-800">{name}</span>,
    },
    {
      title: 'Period From',
      dataIndex: 'period_from',
      render: (date: string) => (
        <span className="text-sm text-neutral-600">{formatDate(date)}</span>
      ),
    },
    {
      title: 'Period To',
      dataIndex: 'period_to',
      render: (date: string) => (
        <span className="text-sm text-neutral-600">{formatDate(date)}</span>
      ),
    },
    {
      title: 'Payslips',
      dataIndex: 'payslip_count',
      render: (count: number) => <span className="text-sm text-neutral-600">{count}</span>,
    },
    {
      title: 'Total Gross',
      dataIndex: 'total_gross',
      render: (amount: string) => <MoneyDisplay amount={amount} currencyCode={currencyCode} />,
    },
    {
      title: 'Total Net',
      dataIndex: 'total_net',
      render: (amount: string) => <MoneyDisplay amount={amount} currencyCode={currencyCode} />,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      render: (state: string) => <StateBadge state={state} />,
    },
  ]

  return (
    <>
    <ModalForm
      title="New Payroll Run"
      open={createOpen}
      onOpenChange={setCreateOpen}
      modalProps={{ destroyOnClose: true }}
      onFinish={async (values) => {
        await createRun.mutateAsync(values as { name: string; period_from: string; period_to: string })
        return true
      }}
    >
      <ProFormText name="name" label="Run Name" rules={[{ required: true }]} />
      <ProFormDatePicker name="period_from" label="Period From" rules={[{ required: true }]} />
      <ProFormDatePicker name="period_to" label="Period To" rules={[{ required: true }]} />
    </ModalForm>
    <ListPage
      title="Payroll Runs"
      breadcrumbs={[{ label: 'Payroll' }, { label: 'Runs' }]}
      controller={controller}
      columns={columns}
      searchable={false}
      createLabel="New Run"
      onCreate={() => setCreateOpen(true)}
      createPermission={{ model: PERMISSIONS.PAYROLL_RUN, action: 'create' }}
      onRowClick={(row) => navigate({ to: '/payroll/runs/$id', params: { id: row.id } })}
    />
    </>
  )
}
