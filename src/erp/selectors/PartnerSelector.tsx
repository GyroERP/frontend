import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { kernelKeys } from '@/api/query-keys'
import { useDebounce } from '@/hooks/use-debounce'
import { ApiSelector, type ApiSelectorOption } from './ApiSelector'
import type { Partner } from '@/api/types/kernel'

type PartnerType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH' | 'EMPLOYEE' | undefined

interface PartnerSelectorProps {
  value: string | null
  onChange: (value: string | null) => void
  partnerType?: PartnerType
  label?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function PartnerSelector({
  value,
  onChange,
  partnerType,
  label,
  placeholder = 'Select partner…',
  clearable = true,
  disabled,
  error,
  className,
}: PartnerSelectorProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: kernelKeys.partnerList({ search: debouncedSearch, partner_type: partnerType }),
    queryFn: () =>
      kernelApi.partners.list({
        search: debouncedSearch || undefined,
        partner_type: partnerType,
        page_size: 25,
      }),
    staleTime: 30_000,
  })

  const options: ApiSelectorOption[] = (data?.data.results ?? []).map((p: Partner) => ({
    value: p.id,
    label: p.name,
    sublabel: p.email ?? p.phone ?? undefined,
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

export function CustomerSelector(props: Omit<PartnerSelectorProps, 'partnerType'>) {
  return <PartnerSelector {...props} partnerType="CUSTOMER" placeholder={props.placeholder ?? 'Select customer…'} />
}

export function SupplierSelector(props: Omit<PartnerSelectorProps, 'partnerType'>) {
  return <PartnerSelector {...props} partnerType="SUPPLIER" placeholder={props.placeholder ?? 'Select supplier…'} />
}
