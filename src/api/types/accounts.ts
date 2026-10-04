import type { UUID, DateTimeString, DateString } from './common'

export interface User {
  id: UUID
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
  is_active: boolean
  is_superuser: boolean
  is_staff: boolean
  is_api_only: boolean
  mfa_enabled: boolean
  must_change_password: boolean
  last_password_change: DateTimeString | null
  date_joined: DateTimeString
  last_login: DateTimeString | null
}

export interface AccountRole {
  id: UUID
  name: string
  code: string
  description: string
  company: UUID | null
  is_active: boolean
  is_system: boolean
  created_at: DateTimeString
}

export interface AccountRoleAssignment {
  id: UUID
  user: UUID
  role: UUID
  role_name: string
  company: UUID | null
  company_name: string | null
  assigned_by: UUID
  date_from: DateString | null
  date_to: DateString | null
  created_at: DateTimeString
}

export interface AccountInvitation {
  id: UUID
  email: string
  invited_by: UUID
  invited_by_name: string
  company: UUID | null
  role: UUID | null
  state: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  expires_at: DateTimeString
  accepted_at: DateTimeString | null
  created_at: DateTimeString
}

export interface AccountMFA {
  id: UUID
  method: 'TOTP' | 'BACKUP' | 'EMAIL'
  is_verified: boolean
  verified_at: DateTimeString | null
}

export interface AccountSession {
  id: UUID
  ip_address: string
  device_type: string
  last_activity: DateTimeString
  expires_at: DateTimeString
  is_active: boolean
  is_current: boolean
}

export interface AccountPasswordPolicy {
  id: UUID
  company: UUID | null
  min_length: number
  require_uppercase: boolean
  require_digits: boolean
  require_symbols: boolean
  max_age_days: number | null
  prevent_reuse_count: number
}

export interface LoginLog {
  id: UUID
  event: 'SUCCESS' | 'FAILED' | 'LOCKED' | 'LOGOUT' | 'API_KEY'
  user: UUID | null
  username_attempted: string | null
  timestamp: DateTimeString
  ip_address: string
  user_agent: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface MFAVerifyPayload {
  code: string
}

export interface LoginResponse {
  user: User
  mfa_required: boolean
}
