import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

// Minimal shape — keeps erp/ free of module type dependencies.
interface EmployeeRow {
  id: string
  full_name: string
  position_name: string | null
  department_name: string | null
  avatar_url: string | null
}

interface EmployeeSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function EmployeeSelector({
  value,
  onChange,
  label,
  placeholder = 'Select employee…',
  clearable = true,
  disabled,
  error,
  className,
}: EmployeeSelectorProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['erp-selector', 'employees', debouncedSearch],
    queryFn: () =>
      apiClient.get<PaginatedResponse<EmployeeRow>>('/hr/employees/', {
        params: { search: debouncedSearch || undefined, page_size: 25 },
      }),
    staleTime: 30_000,
  })

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((emp) => ({
    value: emp.id,
    label: emp.full_name,
    sublabel: emp.position_name ?? emp.department_name ?? undefined,
    avatar: emp.avatar_url ?? undefined,
    initials: getInitials(emp.full_name),
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
