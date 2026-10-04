import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { accountsKeys } from '@/api/query-keys'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import { accountsApi } from '@/api/endpoints/accounts.api'

interface UserSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function UserSelector({
  value,
  onChange,
  label,
  placeholder = 'Select user…',
  clearable = true,
  disabled,
  error,
  className,
}: UserSelectorProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: accountsKeys.userList({ search: debouncedSearch }),
    queryFn: () => accountsApi.users.list({ search: debouncedSearch || undefined, page_size: 25 }),
    staleTime: 30_000,
  })

  function getInitials(user: { first_name?: string; last_name?: string; username?: string }) {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return (user.username?.[0] ?? 'U').toUpperCase()
  }

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((user) => ({
    value: user.id,
    label: user.full_name ?? user.username,
    sublabel: user.email ?? undefined,
    initials: getInitials(user),
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
