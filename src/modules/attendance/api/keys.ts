import type { ListParams } from '@/api/types/common'

export const attendanceKeys = {
  all:         () => ['attendance'] as const,
  records:     (p?: ListParams) => [...attendanceKeys.all(), 'records', p] as const,
  timesheets:  (p?: ListParams) => [...attendanceKeys.all(), 'timesheets', p] as const,
  shifts:      (p?: ListParams) => [...attendanceKeys.all(), 'shifts', p] as const,
  overtime:    (p?: ListParams) => [...attendanceKeys.all(), 'overtime', p] as const,
  analytics:   {
    summary:   (p?: ListParams) => [...attendanceKeys.all(), 'analytics', 'summary', p] as const,
    laborCost: (p?: ListParams) => [...attendanceKeys.all(), 'analytics', 'labor-cost', p] as const,
    overtime:  (p?: ListParams) => [...attendanceKeys.all(), 'analytics', 'overtime', p] as const,
  },
}
