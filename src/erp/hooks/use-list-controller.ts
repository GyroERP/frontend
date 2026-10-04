/**
 * useListController — the standard engine behind every list page.
 *
 * Owns: search (debounced), pagination, extra filters, the query itself,
 * and URL synchronisation (?q=&page=&…) so filtered lists survive refresh
 * and can be shared. Pages only declare WHAT to fetch:
 *
 *   const ctl = useListController<ProductTemplate>({
 *     queryKey: (p) => inventoryKeys.productList(p),
 *     url: '/inventory/products/',
 *   })
 */
import { useCallback, useMemo, useState } from 'react'
import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useDebounce } from '@/hooks/use-debounce'
import type { ListParams, PaginatedResponse } from '@/api/types/common'

interface ListControllerOptions {
  queryKey: (params: ListParams) => QueryKey
  url: string
  pageSize?: number
  /** Static params always sent (e.g. { is_active: true }). */
  extraParams?: Record<string, unknown>
  /** Sync q/page/filters to the URL query string (default true). */
  urlSync?: boolean
  staleTime?: number
}

export interface ListController<T> {
  search: string
  setSearch: (value: string) => void
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string | null) => void
  rows: T[]
  total: number
  isLoading: boolean
  query: UseQueryResult<{ data: PaginatedResponse<T> }>
}

function readInitialState(urlSync: boolean) {
  if (!urlSync || typeof window === 'undefined') {
    return { search: '', page: 1, pageSize: null as number | null, filters: {} as Record<string, string> }
  }
  const params = new URLSearchParams(window.location.search)
  const search = params.get('q') ?? ''
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)
  const pageSizeRaw = params.get('page_size')
  const pageSize = pageSizeRaw ? Math.max(1, parseInt(pageSizeRaw, 10) || 0) || null : null
  const filters: Record<string, string> = {}
  params.forEach((value, key) => {
    if (key !== 'q' && key !== 'page') filters[key] = value
  })
  return { search, page, pageSize, filters }
}

function writeUrl(
  search: string,
  page: number,
  pageSize: number | null,
  defaultPageSize: number,
  filters: Record<string, string>,
) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (page > 1) params.set('page', String(page))
  if (pageSize !== null && pageSize !== defaultPageSize) params.set('page_size', String(pageSize))
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v)
  }
  const qs = params.toString()
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`
  window.history.replaceState(window.history.state, '', next)
}

export function useListController<T>(options: ListControllerOptions): ListController<T> {
  const {
    queryKey,
    url,
    pageSize: defaultPageSize = 25,
    extraParams,
    urlSync = true,
    staleTime = 30_000,
  } = options

  const [initial] = useState(() => readInitialState(urlSync))
  const [search, setSearchState] = useState(initial.search)
  const [page, setPageState] = useState(initial.page)
  const [pageSizeState, setPageSizeState] = useState(
    initial.pageSize ?? defaultPageSize,
  )
  const [filters, setFilters] = useState<Record<string, string>>(initial.filters)
  const debouncedSearch = useDebounce(search, 300)

  const sync = useCallback(
    (s: string, p: number, ps: number, f: Record<string, string>) => {
      if (urlSync) writeUrl(s, p, ps, defaultPageSize, f)
    },
    [urlSync, defaultPageSize],
  )

  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value)
      setPageState(1)
      sync(value, 1, pageSizeState, filters)
    },
    [filters, pageSizeState, sync],
  )

  const setPage = useCallback(
    (p: number) => {
      setPageState(p)
      sync(search, p, pageSizeState, filters)
    },
    [search, filters, pageSizeState, sync],
  )

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size)
      setPageState(1)
      sync(search, 1, size, filters)
    },
    [search, filters, sync],
  )

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      setFilters((prev) => {
        const next = { ...prev }
        if (value === null || value === '') delete next[key]
        else next[key] = value
        sync(search, 1, pageSizeState, next)
        return next
      })
      setPageState(1)
    },
    [search, pageSizeState, sync],
  )

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page,
      page_size: pageSizeState,
      ...filters,
      ...extraParams,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, page, pageSizeState, JSON.stringify(filters), JSON.stringify(extraParams)],
  )

  const query = useQuery({
    queryKey: queryKey(params as ListParams),
    queryFn: () => apiClient.get<PaginatedResponse<T>>(url, { params }),
    staleTime,
  })

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize: pageSizeState,
    setPageSize,
    filters,
    setFilter,
    rows: query.data?.data.results ?? [],
    total: query.data?.data.count ?? 0,
    isLoading: query.isLoading,
    query,
  }
}
