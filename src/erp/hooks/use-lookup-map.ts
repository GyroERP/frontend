/**
 * useLookupMap — build a Record<id, value> from a reference-data endpoint.
 *
 * Replaces the hand-rolled prefetch + map-building repeated on detail pages:
 *
 *   const locationName = useLookupMap<StockLocation>({
 *     queryKey: inventoryKeys.locations({ page_size: 500 }),
 *     url: '/inventory/stock-locations/',
 *     params: { page_size: 500, is_active: true },
 *     select: (loc) => loc.full_name,
 *   })
 *   … locationName[move.location_src] ?? '—'
 */
import { useMemo } from 'react'
import { useQuery, type QueryKey } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

interface LookupMapOptions<T, V> {
  queryKey: QueryKey
  url: string
  params?: Record<string, unknown>
  select: (item: T) => V
  /** Field used as the map key (default 'id'). */
  idField?: keyof T
  staleTime?: number
  enabled?: boolean
}

export function useLookupMap<T, V = string>(
  options: LookupMapOptions<T, V>,
): Record<string, V> {
  const {
    queryKey,
    url,
    params,
    select,
    idField = 'id' as keyof T,
    staleTime = 300_000,
    enabled = true,
  } = options

  const { data } = useQuery({
    queryKey,
    queryFn: () => apiClient.get<PaginatedResponse<T>>(url, { params }),
    staleTime,
    enabled,
  })

  return useMemo(() => {
    const map: Record<string, V> = {}
    for (const item of data?.data.results ?? []) {
      map[String(item[idField])] = select(item)
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
}
