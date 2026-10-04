import { useEffect, useState } from 'react'
import { Tag } from 'antd'

export interface SavedFilterPreset {
  id: string
  label: string
  filters: Record<string, string>
}

interface SavedFilterBarProps {
  storageKey: string
  presets: SavedFilterPreset[]
  activeFilters: Record<string, string>
  onApply: (filters: Record<string, string>) => void
  onClear: () => void
}

export function SavedFilterBar({
  storageKey,
  presets,
  activeFilters,
  onApply,
  onClear,
}: SavedFilterBarProps) {
  const [lastId, setLastId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setLastId(raw)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const activeCount = Object.keys(activeFilters).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500">Quick filters:</span>
      {presets.map((p) => {
        const selected = lastId === p.id && activeCount > 0
        return (
          <Tag.CheckableTag
            key={p.id}
            checked={selected}
            onChange={(checked) => {
              if (checked) {
                setLastId(p.id)
                try {
                  localStorage.setItem(storageKey, p.id)
                } catch {
                  /* ignore */
                }
                onApply(p.filters)
              } else {
                setLastId(null)
                try {
                  localStorage.removeItem(storageKey)
                } catch {
                  /* ignore */
                }
                onClear()
              }
            }}
          >
            {p.label}
          </Tag.CheckableTag>
        )
      })}
    </div>
  )
}
