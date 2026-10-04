import type { ListParams } from '@/api/types/common'

export const accountingKeys = {
  all:         () => ['accounting'] as const,
  accounts:    (p?: ListParams) => [...accountingKeys.all(), 'accounts', p] as const,
  moves:       () => [...accountingKeys.all(), 'moves'] as const,
  moveList:    (p?: ListParams) => [...accountingKeys.moves(), 'list', p] as const,
  move:        (id: string) => [...accountingKeys.moves(), id] as const,
  payments:    (p?: ListParams) => [...accountingKeys.all(), 'payments', p] as const,
  bankStatements: (p?: ListParams) => [...accountingKeys.all(), 'bank-statements', p] as const,
  analytic:    (p?: ListParams) => [...accountingKeys.all(), 'analytic-accounts', p] as const,
}
