import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

// Minimal shape — keeps erp/ free of module type dependencies.
interface AccountRow {
  id: string
  name: string
  code: string
}

interface AccountSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  accountType?: string
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function AccountSelector({
  value,
  onChange,
  accountType,
  label,
  placeholder = 'Select account…',
  clearable = true,
  disabled,
  error,
  className,
}: AccountSelectorProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['erp-selector', 'accounts', debouncedSearch, accountType],
    queryFn: () =>
      apiClient.get<PaginatedResponse<AccountRow>>('/accounting/accounts/', {
        params: {
          search: debouncedSearch || undefined,
          account_type: accountType,
          page_size: 25,
        },
      }),
    staleTime: 60_000,
  })

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((acct) => ({
    value: acct.id,
    label: acct.name,
    sublabel: acct.code,
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
