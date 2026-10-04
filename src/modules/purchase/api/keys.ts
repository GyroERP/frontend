import type { ListParams } from '@/api/types/common'

export const purchaseKeys = {
  all:         () => ['purchase'] as const,
  orders:      () => [...purchaseKeys.all(), 'orders'] as const,
  orderList:   (p?: ListParams) => [...purchaseKeys.orders(), 'list', p] as const,
  order:       (id: string) => [...purchaseKeys.orders(), id] as const,
  requisitions:(p?: ListParams) => [...purchaseKeys.all(), 'requisitions', p] as const,
  agreements:  (p?: ListParams) => [...purchaseKeys.all(), 'agreements', p] as const,
  rfq:         (p?: ListParams) => [...purchaseKeys.all(), 'rfq', p] as const,
}
