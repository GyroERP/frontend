import { useQuery } from '@tanstack/react-query'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

// Minimal shape — keeps erp/ free of module type dependencies.
interface WarehouseRow {
  id: string
  name: string
  code: string | null
}

interface WarehouseSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function WarehouseSelector({
  value,
  onChange,
  label,
  placeholder = 'Select warehouse…',
  clearable = true,
  disabled,
  error,
  className,
}: WarehouseSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['erp-selector', 'warehouses'],
    queryFn: () =>
      apiClient.get<PaginatedResponse<WarehouseRow>>('/inventory/warehouses/', {
        params: { page_size: 100 },
      }),
    staleTime: 5 * 60_000,
  })

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((w) => ({
    value: w.id,
    label: w.name,
    sublabel: w.code ?? undefined,
  }))

  return (
    <ApiSelector
      options={options}
      value={value}
      onChange={onChange}
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
