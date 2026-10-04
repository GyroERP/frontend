import type { ListParams } from '@/api/types/common'

export const hrKeys = {
  all:         () => ['hr'] as const,
  employees:   () => [...hrKeys.all(), 'employees'] as const,
  employeeList:(p?: ListParams) => [...hrKeys.employees(), 'list', p] as const,
  employee:    (id: string) => [...hrKeys.employees(), id] as const,
  departments: (p?: ListParams) => [...hrKeys.all(), 'departments', p] as const,
  leaves:      (p?: ListParams) => [...hrKeys.all(), 'leaves', p] as const,
  appraisals:  (p?: ListParams) => [...hrKeys.all(), 'appraisals', p] as const,
  goals:       (p?: ListParams) => [...hrKeys.all(), 'goals', p] as const,
  onboarding:  (p?: ListParams) => [...hrKeys.all(), 'onboarding', p] as const,
  skills:      (p?: ListParams) => [...hrKeys.all(), 'skills', p] as const,
}
