import { Select, Spin, Typography } from 'antd'
import { useMemo } from 'react'
import { cn } from '@/lib/cn'

export interface ApiSelectorOption {
  value: string
  label: string
  sublabel?: string
  avatar?: string
  initials?: string
}

interface ApiSelectorProps {
  options: ApiSelectorOption[]
  value: string | null
  onChange: (value: string | null) => void
  onSearchChange?: (search: string) => void
  isLoading?: boolean
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  error?: string
  label?: string
  className?: string
}

export function ApiSelector({
  options,
  value,
  onChange,
  onSearchChange,
  isLoading,
  placeholder = 'Select…',
  clearable = true,
  disabled,
  error,
  label,
  className,
}: ApiSelectorProps) {
  const selectOptions = useMemo(
    () =>
      options.map((opt) => ({
        value: opt.value,
        label: opt.label,
        opt,
      })),
    [options],
  )

  const id = label ? `selector-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <Select
        id={id}
        showSearch
        allowClear={clearable}
        disabled={disabled}
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={(v) => onChange(v ?? null)}
        onSearch={onSearchChange}
        filterOption={false}
        loading={isLoading}
        status={error ? 'error' : undefined}
        notFoundContent={isLoading ? <Spin size="small" /> : 'No results found'}
        options={selectOptions}
        optionRender={(option) => {
          const opt = (option.data as { opt?: ApiSelectorOption }).opt
          if (!opt) return option.label
          return (
            <div className="flex items-center gap-2 py-0.5">
              {opt.avatar ? (
                <img src={opt.avatar} alt="" className="size-6 rounded-full object-cover shrink-0" />
              ) : opt.initials ? (
                <span className="size-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {opt.initials}
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{opt.label}</span>
                {opt.sublabel && (
                  <Typography.Text type="secondary" className="text-xs block truncate">
                    {opt.sublabel}
                  </Typography.Text>
                )}
              </span>
            </div>
          )
        }}
        className="w-full"
      />
      {error && (
        <Typography.Text type="danger" className="text-xs" role="alert">
          {error}
        </Typography.Text>
      )}
    </div>
  )
}
