import { Tag } from 'antd'

const STATE_TAG_COLOR: Record<string, string> = {
  DONE: 'success',
  SALE: 'success',
  POSTED: 'success',
  APPROVED: 'success',
  PAID: 'success',
  ACTIVE: 'success',
  CONFIRMED: 'success',
  FULL: 'success',
  DRAFT: 'default',
  SENT: 'processing',
  IN_PROGRESS: 'processing',
  PARTIAL: 'processing',
  SUBMITTED: 'processing',
  PROCESSING: 'processing',
  ASSIGNED: 'processing',
  PENDING: 'processing',
  TO_INVOICE: 'warning',
  TO_RECEIVE: 'warning',
  CONFIRMATION: 'warning',
  CANCELLED: 'error',
  FAILED: 'error',
  REJECTED: 'error',
  EXPIRED: 'error',
  LOCKED: 'error',
}

export function StateBadge({ state, className }: { state: string; className?: string }) {
  const color = STATE_TAG_COLOR[state] ?? 'default'
  return (
    <Tag color={color} className={className}>
      {state.replace(/_/g, ' ')}
    </Tag>
  )
}
