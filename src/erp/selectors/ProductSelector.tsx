import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

// Minimal shape of the fields this selector reads — keeps erp/ free of
// module type dependencies (boundary rule).
interface ProductRow {
  id: string
  name: string
  internal_ref: string | null
  category_name: string | null
}

interface ProductSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function ProductSelector({
  value,
  onChange,
  label,
  placeholder = 'Select product…',
  clearable = true,
  disabled,
  error,
  className,
}: ProductSelectorProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['erp-selector', 'products', debouncedSearch],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductRow>>('/inventory/products/', {
        params: { search: debouncedSearch || undefined, page_size: 25 },
      }),
    staleTime: 30_000,
  })

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: p.internal_ref ?? p.category_name ?? undefined,
  }))

  return (
    <ApiSelector
      options={options}
      value={value}
      onChange={onChange}
      onSearchChange={setSearch}
      isLoading={isLoading}
      label={label}
      placeholder={placeholder}
      clearable={clearable}
      disabled={disabled}
      error={error}
      className={className}
    />
  )
}
