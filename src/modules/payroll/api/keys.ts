import type { ListParams } from '@/api/types/common'

export const payrollKeys = {
  all:         () => ['payroll'] as const,
  runs:        () => [...payrollKeys.all(), 'runs'] as const,
  runList:     (p?: ListParams) => [...payrollKeys.runs(), 'list', p] as const,
  run:         (id: string) => [...payrollKeys.runs(), id] as const,
  payslips:    (p?: ListParams) => [...payrollKeys.all(), 'payslips', p] as const,
  payslip:     (id: string) => [...payrollKeys.all(), 'payslips', id] as const,
  structures:  (p?: ListParams) => [...payrollKeys.all(), 'structures', p] as const,
}
