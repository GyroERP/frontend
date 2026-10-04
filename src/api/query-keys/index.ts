/**
 * PLATFORM query key factories — kernel + accounts only.
 *
 * Business module keys live inside each module: @/modules/<name> exports its
 * own key factory (e.g. inventoryKeys from @/modules/inventory). This file
 * must never import from modules/.
 */

import type { ListParams } from '../types/common'

// ── Accounts ──────────────────────────────────
export const accountsKeys = {
  all:       () => ['accounts'] as const,
  me:        () => [...accountsKeys.all(), 'me'] as const,
  users:     () => [...accountsKeys.all(), 'users'] as const,
  userList:  (p?: ListParams) => [...accountsKeys.users(), 'list', p] as const,
  user:      (id: string) => [...accountsKeys.users(), id] as const,
  roles:     () => [...accountsKeys.all(), 'roles'] as const,
  roleList:  (p?: ListParams) => [...accountsKeys.roles(), 'list', p] as const,
  sessions:  () => [...accountsKeys.all(), 'sessions'] as const,
  loginLogs: (p?: ListParams) => [...accountsKeys.all(), 'login-logs', p] as const,
  invitations: (p?: ListParams) => [...accountsKeys.all(), 'invitations', p] as const,
}

// ── Kernel ────────────────────────────────────
export const kernelKeys = {
  all:         () => ['kernel'] as const,
  companies:   () => [...kernelKeys.all(), 'companies'] as const,
  companyList: (p?: ListParams) => [...kernelKeys.companies(), 'list', p] as const,
  company:     (id: string) => [...kernelKeys.companies(), id] as const,
  partners:    () => [...kernelKeys.all(), 'partners'] as const,
  partnerList: (p?: ListParams) => [...kernelKeys.partners(), 'list', p] as const,
  partner:     (id: string) => [...kernelKeys.partners(), id] as const,
  currencies:  () => [...kernelKeys.all(), 'currencies'] as const,
  countries:   () => [...kernelKeys.all(), 'countries'] as const,
  countryStates: (countryId?: string) => [...kernelKeys.all(), 'country-states', countryId] as const,
  languages:   () => [...kernelKeys.all(), 'languages'] as const,
  auditLog:    (p?: ListParams) => [...kernelKeys.all(), 'audit-log', p] as const,
  attachments: (contentType?: string, objectId?: string) =>
    [...kernelKeys.all(), 'attachments', contentType, objectId] as const,
  messages: (contentType: string, objectId: string) =>
    [...kernelKeys.all(), 'messages', contentType, objectId] as const,
  apiKeys:     (p?: ListParams) => [...kernelKeys.all(), 'api-keys', p] as const,
}
