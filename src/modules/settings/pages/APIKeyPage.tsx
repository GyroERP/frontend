import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Tag } from 'antd'
import { Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { kernelKeys } from '@/api/query-keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { formatDate } from '@/lib/date'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import type { APIKey } from '@/api/types/kernel'

export function APIKeyPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<APIKey | null>(null)

  const [form, setForm] = useState({
    name: '',
    scope: 'READ' as 'READ' | 'WRITE' | 'FULL',
    expires_at: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: kernelKeys.apiKeys(),
    queryFn: () => kernelApi.apiKeys.list(),
    staleTime: 30_000,
  })

  const create = useMutation({
    mutationFn: () => kernelApi.apiKeys.create(form),
    onSuccess: (res) => {
      setNewKeyData({ key: res.data.raw_key, name: form.name })
      setCreateOpen(false)
      setForm({ name: '', scope: 'READ', expires_at: '' })
      void queryClient.invalidateQueries({ queryKey: kernelKeys.apiKeys() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const revoke = useMutation({
    mutationFn: (id: string) => kernelApi.apiKeys.revoke(id),
    onSuccess: () => {
      notify.success('API key revoked')
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: kernelKeys.apiKeys() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const keys: APIKey[] = data?.data.results ?? []

  return (
    <PageShell
      title="API Keys"
      breadcrumbs={[{ label: 'Settings' }, { label: 'API Keys' }]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          New API Key
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {isLoading ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p>No API keys yet.</p>
          </div>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between gap-4 bg-white border border-neutral-200 rounded-lg p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-800 truncate">{k.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Tag>{k.scope}</Tag>
                  <span className="text-xs text-neutral-400">
                    Created {formatDate(k.created_at)}
                  </span>
                  {k.expires_at && (
                    <span className="text-xs text-neutral-400">
                      Expires {formatDate(k.expires_at)}
                    </span>
                  )}
                  {!k.is_active && <Tag color="error">Revoked</Tag>}
                </div>
              </div>
              {k.is_active && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setDeleteTarget(k)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        open={createOpen}
        title="Create API Key"
        onCancel={() => setCreateOpen(false)}
        onOk={() => create.mutate()}
        okText="Create"
        confirmLoading={create.isPending}
        okButtonProps={{ disabled: !form.name }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Name</label>
            <Input
              placeholder="e.g. Production integration"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Scope</label>
            <div className="flex gap-2">
              {(['READ', 'WRITE', 'FULL'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, scope: s }))}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    form.scope === s
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Expiry date (optional)
            </label>
            <Input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!newKeyData}
        title="API Key Created"
        onCancel={() => {
          setNewKeyData(null)
          setShowKey(false)
        }}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setNewKeyData(null)
              setShowKey(false)
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">Copy this key now — it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-3 py-2 text-xs font-mono break-all">
              {showKey ? newKeyData?.key : '•'.repeat(newKeyData?.key.length ?? 0)}
            </code>
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="p-2 text-neutral-400 hover:text-neutral-600"
              aria-label={showKey ? 'Hide key' : 'Reveal key'}
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                if (newKeyData?.key) {
                  void navigator.clipboard.writeText(newKeyData.key)
                  notify.success('Copied to clipboard')
                }
              }}
              className="p-2 text-neutral-400 hover:text-neutral-600"
              aria-label="Copy key"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Revoke API key"
        okText="Revoke"
        okButtonProps={{ danger: true, loading: revoke.isPending }}
        onCancel={() => setDeleteTarget(null)}
        onOk={() => deleteTarget && revoke.mutate(deleteTarget.id)}
      >
        Revoke &quot;{deleteTarget?.name}&quot;? Any integrations using this key will stop working.
      </Modal>
    </PageShell>
  )
}
