import type { UUID, DateTimeString, DecimalString } from '@/api/types/common'

export type ProviderType = 'OPENAI' | 'ANTHROPIC' | 'OLLAMA' | 'AZURE_OPENAI'
export type AgentType = 'CHAT' | 'WORKFLOW' | 'DOCUMENT_EXTRACTION'
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'
export type DocType = 'INVOICE' | 'PO' | 'RECEIPT' | 'CONTRACT' | 'OTHER'
export type DocState = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
export type ConversationState = 'ACTIVE' | 'ARCHIVED' | 'DELETED'

export interface AIProvider {
  id: UUID
  company: UUID | null
  name: string
  provider_type: ProviderType
  base_url: string | null
  is_active: boolean
  created_at: DateTimeString
}

export interface AIModel {
  id: UUID
  provider: UUID
  provider_name: string
  name: string
  model_id: string
  context_window: number
  cost_per_1k_input: DecimalString
  cost_per_1k_output: DecimalString
  is_active: boolean
}

export interface AIConversation {
  id: UUID
  company: UUID
  user: UUID
  user_name: string
  agent_type: AgentType
  context_module: string | null
  title: string | null
  state: ConversationState
  message_count: number
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface AIMessage {
  id: UUID
  conversation: UUID
  role: MessageRole
  raw_text: string | null
  content: Record<string, unknown>
  tokens_in: number
  tokens_out: number
  created_at: DateTimeString
}

export interface AIDocument {
  id: UUID
  company: UUID
  document_type: DocType
  file_url: string | null
  attachment: UUID | null
  state: DocState
  extracted_data: Record<string, unknown> | null
  confidence_score: DecimalString | null
  error_message: string | null
  processed_at: DateTimeString | null
  created_at: DateTimeString
}

export interface AIUsageLog {
  id: UUID
  user: UUID
  user_name: string
  company: UUID
  model: UUID
  model_name: string
  task_type: string
  erp_module: string | null
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: DecimalString
  created_at: DateTimeString
}

export interface SendMessagePayload {
  conversation_id: UUID
  message: string
}

export interface CreateConversationPayload {
  agent_type: AgentType
  context_module?: string
  title?: string
}
