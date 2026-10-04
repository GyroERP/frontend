import type { ListParams } from '@/api/types/common'

export const aiKeys = {
  all:           () => ['gyroai'] as const,
  conversations: (p?: ListParams) => [...aiKeys.all(), 'conversations', p] as const,
  conversation:  (id: string) => [...aiKeys.all(), 'conversations', id] as const,
  messages:      (conversationId: string) => [...aiKeys.conversation(conversationId), 'messages'] as const,
  documents:     (p?: ListParams) => [...aiKeys.all(), 'documents', p] as const,
  document:      (id: string) => [...aiKeys.all(), 'documents', id] as const,
  usage:         (p?: ListParams) => [...aiKeys.all(), 'usage', p] as const,
  providers:     () => [...aiKeys.all(), 'providers'] as const,
  models:        () => [...aiKeys.all(), 'models'] as const,
}
