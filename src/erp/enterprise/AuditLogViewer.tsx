import { useQuery } from '@tanstack/react-query'
import { Skeleton, Tag } from 'antd'
import { kernelKeys } from '@/api/query-keys'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { formatDateTime } from '@/lib/date'
import { useTimezone } from '@/hooks/use-company'

interface AuditLogViewerProps {
  contentType?: string
  objectId?: string
  maxItems?: number
  className?: string
}

const ACTION_COLOR = {
  CREATE: 'success',
  UPDATE: 'processing',
  DELETE: 'error',
  CUSTOM: 'default',
} as const

export function AuditLogViewer({ contentType, objectId, maxItems = 50, className }: AuditLogViewerProps) {
  const timezone = useTimezone()
  const params = {
    content_type: contentType,
    object_id: objectId,
    page_size: maxItems,
  }

  const { data, isLoading } = useQuery({
    queryKey: kernelKeys.auditLog(params),
    queryFn: () => kernelApi.auditLog.list(params),
  })

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />

  const entries = data?.data.results ?? []

  if (entries.length === 0) {
    return <div className="text-sm text-neutral-400 text-center py-8">No audit log entries found</div>
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-neutral-100">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-3 py-3">
            <Tag color={ACTION_COLOR[entry.action as keyof typeof ACTION_COLOR] ?? 'default'} className="mt-0.5 shrink-0">
              {entry.action}
            </Tag>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-700 truncate">{entry.object_repr}</p>
              <p className="text-xs text-neutral-400">
                {entry.user_name ?? 'System'} · {formatDateTime(entry.timestamp, timezone)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
