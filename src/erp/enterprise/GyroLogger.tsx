/**
 * GyroLogger — Odoo Chatter equivalent.
 *
 * Per-record activity panel: user comments, internal notes, automatic
 * field-change tracking, and attachments. Drop into any detail page via
 * PageShell's `aside` prop:
 *
 *   <PageShell aside={<GyroLogger contentType="inventory.producttemplate" objectId={id} />}>
 */
import { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserAddOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MessageOutlined,
  PaperClipOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { notify } from '@/lib/notify'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { extractErrorMessage } from '@/api/client'
import { kernelKeys, accountsKeys } from '@/api/query-keys'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar, Segmented, Spin, Typography } from 'antd'
import { formatRelative } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { GyroMessage } from '@/api/types/kernel'
import type { User } from '@/api/types/accounts'

/** Matches an "@partial" token immediately before the caret. */
const MENTION_TOKEN_RE = /@([^\s@]*)$/

function displayName(u: User): string {
  return u.full_name || u.username
}

interface GyroLoggerProps {
  /** Django content type as "app_label.model", e.g. "inventory.producttemplate" */
  contentType: string
  objectId: string
}

type ComposerMode = 'comment' | 'note'

export function GyroLogger({ contentType, objectId }: GyroLoggerProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [mode, setMode] = useState<ComposerMode>('comment')
  const [body, setBody] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── @mention state ──
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionAnchor, setMentionAnchor] = useState(0)
  const [mentionIndex, setMentionIndex] = useState(0)
  // name → user id, accumulated as the user picks suggestions
  const [pickedMentions, setPickedMentions] = useState<Record<string, string>>({})

  const { data: usersData } = useQuery({
    queryKey: accountsKeys.userList({ page_size: 200 }),
    queryFn: () => accountsApi.users.list({ page_size: 200 }),
    staleTime: 300_000,
  })
  const allUsers = useMemo(
    () => usersData?.data.results ?? [],
    [usersData],
  )

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return allUsers
      .filter((u) => u.id !== currentUser?.id)
      .filter((u) =>
        !q ||
        displayName(u).toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
      )
      .slice(0, 5)
  }, [mentionQuery, allUsers, currentUser?.id])

  function detectMention(value: string, caret: number) {
    const before = value.slice(0, caret)
    const match = MENTION_TOKEN_RE.exec(before)
    if (match) {
      setMentionQuery(match[1] ?? '')
      setMentionAnchor(caret - match[0].length)
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  function pickMention(user: User) {
    const name = displayName(user)
    const el = textareaRef.current
    const caret = el?.selectionStart ?? body.length
    const next = `${body.slice(0, mentionAnchor)}@${name} ${body.slice(caret)}`
    setBody(next)
    setPickedMentions((prev) => ({ ...prev, [name]: user.id }))
    setMentionQuery(null)
    requestAnimationFrame(() => {
      const pos = mentionAnchor + name.length + 2
      el?.focus()
      el?.setSelectionRange(pos, pos)
    })
  }

  const messagesKey = kernelKeys.messages(contentType, objectId)
  const attachmentsKey = kernelKeys.attachments(contentType, objectId)

  const { data: messagesData, isLoading } = useQuery({
    queryKey: messagesKey,
    queryFn: () =>
      kernelApi.messages.list({
        content_type: contentType,
        object_id: objectId,
        page_size: 100,
      }),
    staleTime: 15_000,
  })

  const { data: attachmentsData } = useQuery({
    queryKey: attachmentsKey,
    queryFn: () =>
      kernelApi.attachments.list({
        content_type: contentType,
        object_id: objectId,
        page_size: 50,
      }),
    staleTime: 30_000,
  })

  const messages = messagesData?.data.results ?? []
  const attachments = attachmentsData?.data.results ?? []

  const postMutation = useMutation({
    mutationFn: () => {
      // Only send mentions whose "@Name" text survived edits to the body.
      const ids = Object.entries(pickedMentions)
        .filter(([name]) => body.includes(`@${name}`))
        .map(([, id]) => id)
      return kernelApi.messages.create({
        content_type: contentType,
        object_id: objectId,
        message_type: mode,
        body: body.trim(),
        mentioned_user_ids: ids,
      })
    },
    onSuccess: () => {
      setBody('')
      setPickedMentions({})
      setMentionQuery(null)
      void queryClient.invalidateQueries({ queryKey: messagesKey })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => kernelApi.messages.delete(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: messagesKey }),
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('name', file.name)
      fd.append('file', file)
      fd.append('content_type', contentType)
      fd.append('object_id', objectId)
      return kernelApi.attachments.upload(fd)
    },
    onSuccess: () => {
      notify.success('Attachment uploaded')
      void queryClient.invalidateQueries({ queryKey: attachmentsKey })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: string) => kernelApi.attachments.delete(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: attachmentsKey }),
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  function submit() {
    if (!body.trim() || postMutation.isPending) return
    postMutation.mutate()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
        <HistoryOutlined className="text-neutral-400" />
        <Typography.Title level={5} className="!mb-0">
          Activity
        </Typography.Title>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-b border-neutral-200 p-3">
        <Segmented
          className="mb-2"
          size="small"
          value={mode}
          onChange={(v) => setMode(v as ComposerMode)}
          options={[
            { label: 'Message', value: 'comment', icon: <MessageOutlined /> },
            { label: 'Log note', value: 'note', icon: <FileTextOutlined /> },
          ]}
        />

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              detectMention(e.target.value, e.target.selectionStart ?? 0)
            }}
            onKeyDown={(e) => {
              if (mentionQuery !== null && mentionSuggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setMentionIndex((i) => (i + 1) % mentionSuggestions.length)
                  return
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setMentionIndex((i) =>
                    (i - 1 + mentionSuggestions.length) % mentionSuggestions.length,
                  )
                  return
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault()
                  const picked = mentionSuggestions[mentionIndex]
                  if (picked) pickMention(picked)
                  return
                }
                if (e.key === 'Escape') {
                  setMentionQuery(null)
                  return
                }
              }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
            }}
            onBlur={() => {
              // Delay so a click on a suggestion still registers.
              setTimeout(() => setMentionQuery(null), 150)
            }}
            rows={2}
            placeholder={
              mode === 'comment' ? 'Send a message… (@ to mention)' : 'Log an internal note…'
            }
            className={cn(
              'w-full text-sm rounded-lg border p-2.5 resize-y focus:outline-none focus:ring-1',
              mode === 'note'
                ? 'bg-amber-50 border-amber-200 focus:ring-amber-400'
                : 'border-neutral-200 focus:ring-brand-400',
            )}
          ></textarea>

          {/* @mention suggestions */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full z-20 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
              role="listbox"
              aria-label="Mention a user"
            >
              {mentionSuggestions.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={i === mentionIndex}
                  onMouseDown={(e) => {
                    e.preventDefault() // fire before textarea blur
                    pickMention(u)
                  }}
                  onMouseEnter={() => setMentionIndex(i)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                    i === mentionIndex ? 'bg-brand-50' : 'hover:bg-neutral-50',
                  )}
                >
                  <Avatar src={u.avatar_url} size="small">
                    {displayName(u)[0]}
                  </Avatar>
                  <span className="text-sm text-neutral-700 truncate">{displayName(u)}</span>
                  <span className="text-xs text-neutral-400 truncate">@{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded transition-colors"
              title="Attach a file"
            >
              {uploadMutation.isPending ? <Spin size="small" /> : <PaperClipOutlined />}
              Attach
            </button>
            <button
              type="button"
              onClick={() => {
                const el = textareaRef.current
                const caret = el?.selectionStart ?? body.length
                const needsSpace = caret > 0 && !/\s$/.test(body.slice(0, caret))
                const inserted = `${body.slice(0, caret)}${needsSpace ? ' ' : ''}@${body.slice(caret)}`
                setBody(inserted)
                const pos = caret + (needsSpace ? 2 : 1)
                requestAnimationFrame(() => {
                  el?.focus()
                  el?.setSelectionRange(pos, pos)
                })
                setMentionQuery('')
                setMentionAnchor(pos - 1)
                setMentionIndex(0)
              }}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded transition-colors"
              title="Mention a user"
            >
              <UserAddOutlined />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadMutation.mutate(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!body.trim() || postMutation.isPending}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              body.trim()
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
            )}
          >
            {postMutation.isPending ? <Spin size="small" /> : <SendOutlined />}
            {mode === 'comment' ? 'Send' : 'Log'}
          </button>
        </div>
      </div>

      {/* Attachments strip */}
      {attachments.length > 0 && (
        <div className="shrink-0 border-b border-neutral-100 px-4 py-2.5">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
            Attachments ({attachments.length})
          </p>
          <div className="space-y-1">
            {attachments.map((a) => (
              <div key={a.id} className="group flex items-center gap-2 text-xs">
                <FileTextOutlined className="text-neutral-400 shrink-0" />
                <span className="flex-1 truncate text-neutral-600" title={a.name}>{a.name}</span>
                {a.file_url && (
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 hover:text-brand-600"
                    aria-label={`Download ${a.name}`}
                  >
                    <DownloadOutlined />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => deleteAttachmentMutation.mutate(a.id)}
                  className="text-neutral-300 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${a.name}`}
                >
                  <DeleteOutlined />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-8">
            No activity yet — post the first message.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <TimelineEntry
                key={msg.id}
                message={msg}
                isOwn={msg.author != null && msg.author === currentUser?.id}
                onDelete={() => deleteMutation.mutate(msg.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MentionBody({
  body,
  mentions,
}: {
  body: string
  mentions: GyroMessage['mentions']
}) {
  if (!mentions || mentions.length === 0) return <>{body}</>

  // Build one regex matching every "@Name" (longest names first so
  // "@Jane Smith" wins over "@Jane").
  const escaped = [...mentions]
    .sort((a, b) => b.name.length - a.name.length)
    .map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`@(?:${escaped.join('|')})`, 'g')

  const parts: React.ReactNode[] = []
  let last = 0
  for (const match of body.matchAll(re)) {
    const idx = match.index ?? 0
    if (idx > last) parts.push(body.slice(last, idx))
    parts.push(
      <span key={idx} className="text-brand-600 font-medium bg-brand-50 rounded px-0.5">
        {match[0]}
      </span>,
    )
    last = idx + match[0].length
  }
  if (last < body.length) parts.push(body.slice(last))
  return <>{parts}</>
}

function TimelineEntry({
  message,
  isOwn,
  onDelete,
}: {
  message: GyroMessage
  isOwn: boolean
  onDelete: () => void
}) {
  if (message.message_type === 'tracking') {
    return (
      <div className="flex gap-2.5">
        <div className="shrink-0 size-6 rounded-full bg-neutral-100 flex items-center justify-center mt-0.5">
          <HistoryOutlined className="text-neutral-400 text-xs" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-neutral-400">
            {message.author_name ?? 'System'} · {formatRelative(message.created_at)}
          </p>
          <div className="mt-1 space-y-0.5">
            {message.tracked_changes.map((c, i) => (
              <p key={i} className="text-xs text-neutral-600">
                <span className="font-medium">{c.label}</span>
                {': '}
                <span className="text-neutral-400 line-through">{c.old ?? '—'}</span>
                {' → '}
                <span className="text-neutral-700">{c.new ?? '—'}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (message.message_type === 'system') {
    return (
      <p className="text-[11px] text-neutral-400 pl-8">
        {message.body} · {formatRelative(message.created_at)}
      </p>
    )
  }

  const isNote = message.message_type === 'note'
  return (
    <div className="group flex gap-2.5">
      <Avatar src={message.author_avatar} size="small" className="shrink-0 mt-0.5">
        {(message.author_name ?? 'System')[0]}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-neutral-700 truncate">
            {message.author_name ?? 'System'}
          </p>
          <p className="text-[11px] text-neutral-400 shrink-0">
            {formatRelative(message.created_at)}
          </p>
          {isNote && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
              Note
            </span>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto text-neutral-300 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              aria-label="Delete message"
            >
              <DeleteOutlined />
            </button>
          )}
        </div>
        <div
          className={cn(
            'mt-1 text-sm text-neutral-700 whitespace-pre-wrap break-words rounded-lg px-3 py-2',
            isNote ? 'bg-amber-50 border border-amber-100' : 'bg-neutral-50',
          )}
        >
          <MentionBody body={message.body} mentions={message.mentions} />
        </div>
      </div>
    </div>
  )
}
