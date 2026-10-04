import { useQuery } from '@tanstack/react-query'
import { Printer } from 'lucide-react'
import { payrollKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { Button, Skeleton } from 'antd'
import { StateBadge } from '@/erp/display/StateBadge'
import { MoneyDisplay } from '@/erp/enterprise/MoneyDisplay'
import { formatDate } from '@/lib/date'
import { useCurrencyCode } from '@/hooks/use-company'
import { apiClient } from '@/api/client'
import type { Payslip, PayslipLine } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

interface PayslipDetailPageProps {
  payslipId: string
}

export function PayslipDetailPage({ payslipId }: PayslipDetailPageProps) {
  const currencyCode = useCurrencyCode()

  const { data, isLoading } = useQuery({
    queryKey: payrollKeys.payslip(payslipId),
    queryFn: () => apiClient.get<Payslip>(`/payroll/payslips/${payslipId}/`),
    staleTime: 60_000,
  })

  const { data: linesData } = useQuery({
    queryKey: [...payrollKeys.payslips(), payslipId, 'lines'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<PayslipLine>>('/payroll/payslip-lines/', {
        params: { payslip: payslipId, page_size: 100 },
      }),
    enabled: !!payslipId,
    staleTime: 60_000,
  })

  const payslip = data?.data
  const lines = linesData?.data.results ?? []

  if (isLoading) {
    return (
      <PageShell title="Loading…" breadcrumbs={[{ label: 'Payroll' }, { label: '…' }]}>
        <div className="mx-auto space-y-4 max-w-3xl">
          {[...Array(6)].map((_, i) => (
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
          Payslip — {payslip?.employee_name}
          {payslip?.state && <StateBadge state={payslip.state} />}
        </span>
      }
      breadcrumbs={[
        { label: 'Payroll' },
        { label: payslip?.employee_name ?? 'Payslip' },
      ]}
      actions={
        <Button icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 print:max-w-none">
        {/* Header card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-400">Employee</p>
              <p className="font-medium text-neutral-800">{payslip?.employee_name}</p>
            </div>
            <div>
              <p className="text-neutral-400">Period</p>
              <p className="text-neutral-700">
                {payslip ? `${formatDate(payslip.date_from)} – ${formatDate(payslip.date_to)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-neutral-400">Payslip</p>
              <p className="text-neutral-700">{payslip?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-neutral-400">Gross</p>
              <MoneyDisplay amount={payslip?.amount_gross ?? '0'} currencyCode={currencyCode} size="lg" />
            </div>
            <div>
              <p className="text-neutral-400">Deductions</p>
              <MoneyDisplay amount={payslip?.amount_deductions ?? '0'} currencyCode={currencyCode} />
            </div>
            <div>
              <p className="text-neutral-400">Net Pay</p>
              <MoneyDisplay amount={payslip?.amount_net ?? '0'} currencyCode={currencyCode} size="lg" />
            </div>
          </div>
        </div>

        {/* Lines table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <h3 className="text-sm font-semibold text-neutral-700">Payslip Lines</h3>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Category</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{line.wage_type_code}</td>
                  <td className="px-4 py-3 text-neutral-700">{line.wage_type_name}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{line.category}</td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay amount={line.amount} currencyCode={currencyCode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </PageShell>
  )
}
