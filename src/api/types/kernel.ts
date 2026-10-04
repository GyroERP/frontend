import type { UUID, DateTimeString, DateString, DecimalString } from './common'

export interface Company {
  id: UUID
  name: string
  code: string
  country: UUID
  country_name: string
  state: UUID | null
  currency: UUID
  currency_code: string
  currency_name: string
  language: UUID | null
  timezone: string
  email: string | null
  phone: string | null
  vat: string | null
  street: string | null
  street2: string | null
  city: string | null
  zip_code: string | null
  parent: UUID | null
  parent_name: string | null
  logo_url: string | null
  is_active: boolean
  fiscalyear_lock_date: DateString | null
  tax_lock_date: DateString | null
  created_at: DateTimeString
}

export type PartnerType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH' | 'EMPLOYEE'

export interface Partner {
  id: UUID
  name: string
  code: string
  partner_type: PartnerType
  company: UUID
  company_name: string
  is_active: boolean
  email: string | null
  phone: string | null
  website: string | null
  street: string | null
  city: string | null
  zip: string | null
  country: UUID | null
  country_name: string | null
  parent: UUID | null
  parent_name: string | null
  ref_id: string | null
  created_at: DateTimeString
}

export interface Currency {
  id: UUID
  name: string
  code: string        // ISO 4217 e.g. 'USD'
  symbol: string
  is_active: boolean
}

export interface Country {
  id: UUID
  name: string
  code: string        // ISO 3166-1 alpha-2
}

export interface CountryState {
  id: UUID
  country: UUID
  country_name: string
  name: string
  code: string
}

export interface Language {
  id: UUID
  name: string
  code: string        // IETF e.g. 'en-US'
  is_active: boolean
}

export interface Attachment {
  id: UUID
  name: string
  file_url: string | null
  file_size: number
  mime_type: string
  is_public: boolean
  checksum: string
  created_by: UUID | null
  created_by_name: string | null
  created_at: DateTimeString
}

// ── GyroLogger (chatter) ──────────────────────────────────────────────────────

export type GyroMessageType = 'comment' | 'note' | 'tracking' | 'system'

export interface GyroTrackedChange {
  field: string
  label: string
  old: string | null
  new: string | null
}

export interface GyroMention {
  id: UUID
  name: string
}

export interface GyroMessage {
  id: UUID
  content_type: string
  object_id: string
  message_type: GyroMessageType
  body: string
  tracked_changes: GyroTrackedChange[]
  author: UUID | null
  author_name: string | null
  author_avatar: string | null
  mentions: GyroMention[]
  created_at: DateTimeString
}

export interface APIKey {
  id: UUID
  name: string
  prefix: string
  scope: 'FULL' | 'READ' | 'WRITE' | 'CUSTOM'
  allowed_models: string[]
  ip_allowlist: string[]
  expires_at: DateTimeString | null
  last_used_at: DateTimeString | null
  last_used_ip: string | null
  usage_count: number
  is_active: boolean
  created_at: DateTimeString
}

export interface AuditLog {
  id: UUID
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM'
  user: UUID | null
  user_name: string | null
  timestamp: DateTimeString
  content_type: string
  object_id: string
  object_repr: string
}

export interface CurrencyRate {
  id: UUID
  currency: UUID
  currency_code: string
  rate: DecimalString
  date: DateString
}
