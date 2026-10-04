import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, PlayCircle, CheckCircle } from 'lucide-react'
import { payrollKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { Button, Modal } from 'antd'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import { apiClient } from '@/api/client'
import type { PayrollRun, Payslip } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

interface Props {
  runId: string
}

export function PayrollRunDetailPage({ runId }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currencyCode = useCurrencyCode()
  const [approveOpen, setApproveOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const { data: runRes, isLoading } = useQuery({
    queryKey: payrollKeys.run(runId),
    queryFn: () => apiClient.get<PayrollRun>(`/payroll/runs/${runId}/`),
    staleTime: 60_000,
  })

  const { data: payslipsRes } = useQuery({
    queryKey: [...payrollKeys.run(runId), 'payslips'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Payslip>>('/payroll/payslips/', {
        params: { payroll_run: runId, page_size: 100 },
      }),
    enabled: !!runId,
    staleTime: 30_000,
  })

  const transitionMutation = useMutation({
    mutationFn: (nextState: string) =>
      apiClient.post(`/payroll/runs/${runId}/transition/`, { state: nextState }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(runId) })
      queryClient.invalidateQueries({ queryKey: payrollKeys.runs() })
    },
  })

  const run = runRes?.data
  const payslips = payslipsRes?.data.results ?? []

  if (isLoading || !run) {
    return (
      <PageShell title="Payroll Run" breadcrumbs={[{ label: 'Payroll' }, { label: 'Runs', href: '/payroll/runs' }]}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 rounded w-48" />
          <div className="h-32 bg-neutral-100 rounded" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={
        <span className="flex items-center gap-3">
          <span>{run.name}</span>
          <StateBadge state={run.state} />
        </span>
      }
      breadcrumbs={[
        { label: 'Payroll' },
        { label: 'Runs', href: '/payroll/runs' },
        { label: run.name },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate({ to: '/payroll/runs' })}
          >
            Back
          </Button>
          {run.state === 'DRAFT' && (
            <Button
              icon={<PlayCircle className="size-4" />}
              loading={transitionMutation.isPending}
              onClick={() => transitionMutation.mutate('PROCESSING')}
            >
              Execute
            </Button>
          )}
          {run.state === 'PROCESSING' && (
            <Button
              type="primary"
              icon={<CheckCircle className="size-4" />}
              onClick={() => setApproveOpen(true)}
            >
              Approve
            </Button>
          )}
          {run.state === 'APPROVED' && (
            <Button type="primary" onClick={() => setPayOpen(true)}>
              Mark as Paid
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payslip list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-800">
                Payslips ({run.payslip_count})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">Payslip</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wide">Net</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payslips.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400 text-sm">
                        No payslips generated yet
                      </td>
                    </tr>
                  ) : (
                    payslips.map((slip) => (
                      <tr
                        key={slip.id}
                        className="hover:bg-neutral-50 cursor-pointer"
                        onClick={() => navigate({ to: '/payroll/payslips/$id', params: { id: slip.id } })}
                      >
                        <td className="px-4 py-3 font-medium text-neutral-800">{slip.employee_name}</td>
                        <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{slip.name}</td>
                        <td className="px-4 py-3 text-right">
                          <MoneyDisplay amount={slip.amount_gross} currencyCode={currencyCode} />
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          <MoneyDisplay amount={slip.amount_deductions} currencyCode={currencyCode} />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-700">
                          <MoneyDisplay amount={slip.amount_net} currencyCode={currencyCode} />
                        </td>
                        <td className="px-4 py-3">
                          <StateBadge state={slip.state} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="text-xs text-brand-red hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({ to: '/payroll/payslips/$id', params: { id: slip.id } })
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Run Summary</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-neutral-500">Period</dt>
                <dd className="text-sm font-medium text-neutral-800">
                  {formatDate(run.period_from)} – {formatDate(run.period_to)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Payslips</dt>
                <dd className="text-sm font-medium text-neutral-800">{run.payslip_count}</dd>
              </div>
              <div className="border-t border-neutral-100 pt-3">
                <dt className="text-xs text-neutral-500">Total Gross</dt>
                <dd className="text-sm font-semibold text-neutral-800">
                  <MoneyDisplay amount={run.total_gross} currencyCode={currencyCode} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Total Net</dt>
                <dd className="text-sm font-bold text-brand-red">
                  <MoneyDisplay amount={run.total_net} currencyCode={currencyCode} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Modal
        open={approveOpen}
        title="Approve Payroll Run"
        okText="Approve"
        onCancel={() => setApproveOpen(false)}
        onOk={async () => {
          await transitionMutation.mutateAsync('APPROVED')
          setApproveOpen(false)
        }}
      >
        Approve {run.name}? This will lock all payslips.
      </Modal>

      <Modal
        open={payOpen}
        title="Mark as Paid"
        okText="Mark Paid"
        onCancel={() => setPayOpen(false)}
        onOk={async () => {
          await transitionMutation.mutateAsync('PAID')
          setPayOpen(false)
        }}
      >
        Mark {run.name} as paid? This is the final step.
      </Modal>
    </PageShell>
  )
}
