import type { ListParams } from '@/api/types/common'

export const salesKeys = {
  all:          () => ['sales'] as const,
  orders:       () => [...salesKeys.all(), 'orders'] as const,
  orderList:    (p?: ListParams) => [...salesKeys.orders(), 'list', p] as const,
  order:        (id: string) => [...salesKeys.orders(), id] as const,
  orderLines:   (orderId: string) => [...salesKeys.order(orderId), 'lines'] as const,
  pricelists:   (p?: ListParams) => [...salesKeys.all(), 'pricelists', p] as const,
  teams:        (p?: ListParams) => [...salesKeys.all(), 'teams', p] as const,
  commissions:  (p?: ListParams) => [...salesKeys.all(), 'commissions', p] as const,
  returns:      (p?: ListParams) => [...salesKeys.all(), 'returns', p] as const,
  forecasts:    (p?: ListParams) => [...salesKeys.all(), 'forecasts', p] as const,
}
