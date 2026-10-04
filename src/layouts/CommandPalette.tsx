import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Modal, Input, List, Typography, Spin, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDebounce } from '@/hooks/use-debounce'
import { useUIStore } from '@/stores/ui.store'
import { useTranslation } from 'react-i18next'
import { COMMAND_PALETTE_ROUTES } from '@/config/command-palette-routes'
import { MODULES } from '@/config/modules'
import { apiClient } from '@/api/client'
import type { PaginatedResponse } from '@/api/types/common'

interface SearchHit {
  id: string
  label: string
  sub?: string
  path: string
  group: string
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const close = useUIStore((s) => s.closeCommandPalette)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 250)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useUIStore.getState().openCommandPalette()
      }
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        useUIStore.getState().openCommandPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const staticHits = useMemo((): SearchHit[] => {
    const q = debounced.trim().toLowerCase()
    const routes = COMMAND_PALETTE_ROUTES.filter((r) => {
      if (!q) return true
      return (
        r.label.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        (r.keywords?.toLowerCase().includes(q) ?? false)
      )
    }).map((r) => ({
      id: r.id,
      label: r.label,
      path: r.path,
      group: r.group,
    }))

    const apps = MODULES.filter((m) => m.status === 'active').filter((m) => {
      if (!q) return false
      return m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    }).map((m) => ({
      id: `mod-${m.id}`,
      label: m.label,
      sub: m.description,
      path: m.basePath,
      group: 'Apps',
    }))

    return [...apps, ...routes].slice(0, 12)
  }, [debounced])

  const { data: entityHits, isFetching: entitiesLoading } = useQuery({
    queryKey: ['command-palette', 'entities', debounced],
    queryFn: async (): Promise<SearchHit[]> => {
      const q = debounced.trim()
      if (q.length < 2) return []
      const [products, orders, partners] = await Promise.all([
        apiClient.get<PaginatedResponse<{ id: string; name: string }>>('/inventory/products/', {
          params: { search: q, page_size: 5 },
        }),
        apiClient.get<PaginatedResponse<{ id: string; name: string }>>('/sales/orders/', {
          params: { search: q, page_size: 5 },
        }),
        apiClient.get<PaginatedResponse<{ id: string; name: string }>>('/kernel/partners/', {
          params: { search: q, page_size: 5 },
        }),
      ])
      const hits: SearchHit[] = []
      for (const p of products.data.results) {
        hits.push({
          id: `product-${p.id}`,
          label: p.name,
          group: 'Products',
          path: `/inventory/products/${p.id}`,
        })
      }
      for (const o of orders.data.results) {
        hits.push({
          id: `so-${o.id}`,
          label: o.name,
          group: 'Sales Orders',
          path: `/sales/orders/${o.id}`,
        })
      }
      for (const pt of partners.data.results) {
        hits.push({
          id: `partner-${pt.id}`,
          label: pt.name,
          group: 'Partners',
          path: `/partners/${pt.id}`,
        })
      }
      return hits
    },
    enabled: open && debounced.trim().length >= 2,
    staleTime: 15_000,
  })

  const allHits = useMemo(() => {
    const entities = entityHits ?? []
    const seen = new Set<string>()
    const merged: SearchHit[] = []
    for (const h of [...staticHits, ...entities]) {
      if (seen.has(h.path)) continue
      seen.add(h.path)
      merged.push(h)
    }
    return merged.slice(0, 20)
  }, [staticHits, entityHits])

  const go = (path: string) => {
    close()
    void navigate({ to: path })
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      width={560}
      styles={{ body: { padding: 0 } }}
      destroyOnClose
    >
      <div className="p-3 border-b border-neutral-200">
        <Input
          autoFocus
          size="large"
          prefix={<SearchOutlined />}
          placeholder={`${t('app.commandPalettePlaceholder')} (Ctrl+K)`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && allHits[0]) go(allHits[0].path)
            if (e.key === 'Escape') close()
          }}
        />
      </div>
      <div className="max-h-[360px] overflow-y-auto p-2">
        {entitiesLoading && debounced.length >= 2 ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : allHits.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" className="py-8" />
        ) : (
          <List
            dataSource={allHits}
            renderItem={(item) => (
              <List.Item
                className="!px-3 !py-2 rounded-md cursor-pointer hover:bg-neutral-50"
                onClick={() => go(item.path)}
              >
                <List.Item.Meta
                  title={<span className="text-sm font-medium">{item.label}</span>}
                  description={
                    <Typography.Text type="secondary" className="text-xs">
                      {item.group}
                      {item.sub ? ` · ${item.sub}` : ''}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  )
}
