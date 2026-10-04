import apiClient from '../client'
import type { PaginatedResponse, ListParams } from '../types/common'
import type {
  User, AccountRole, AccountRoleAssignment, AccountInvitation,
  AccountMFA, AccountSession, AccountPasswordPolicy, LoginLog,
  LoginPayload, MFAVerifyPayload, LoginResponse,
} from '../types/accounts'

const BASE = '/accounts'

export const accountsApi = {
  // ── Auth ──
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>(`${BASE}/login/`, payload),

  logout: () =>
    apiClient.post(`${BASE}/logout/`),

  mfaVerify: (payload: MFAVerifyPayload) =>
    apiClient.post(`${BASE}/mfa/verify/`, payload),

  me: () =>
    apiClient.get<User>(`${BASE}/me/`),

  forgotPassword: (email: string) =>
    apiClient.post(`${BASE}/password/reset/`, { email }),

  resetPassword: (data: { token: string; uid: string; new_password: string }) =>
    apiClient.post(`${BASE}/password/reset/confirm/`, data),

  acceptInvitation: (data: { token: string; name: string; password: string }) =>
    apiClient.post(`${BASE}/invitations/${data.token}/accept/`, {
      name: data.name,
      password: data.password,
    }),

  // ── Users ──
  users: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<User>>(`${BASE}/users/`, { params }),
    get: (id: string) =>
      apiClient.get<User>(`${BASE}/users/${id}/`),
    create: (data: Partial<User>) =>
      apiClient.post<User>(`${BASE}/users/`, data),
    update: (id: string, data: Partial<User>) =>
      apiClient.patch<User>(`${BASE}/users/${id}/`, data),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/users/${id}/`),
  },

  // ── Roles ──
  roles: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<AccountRole>>(`${BASE}/roles/`, { params }),
    get: (id: string) =>
      apiClient.get<AccountRole>(`${BASE}/roles/${id}/`),
    create: (data: Partial<AccountRole>) =>
      apiClient.post<AccountRole>(`${BASE}/roles/`, data),
    update: (id: string, data: Partial<AccountRole>) =>
      apiClient.patch<AccountRole>(`${BASE}/roles/${id}/`, data),
  },

  // ── Role Assignments ──
  roleAssignments: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<AccountRoleAssignment>>(`${BASE}/role-assignments/`, { params }),
    create: (data: Partial<AccountRoleAssignment>) =>
      apiClient.post<AccountRoleAssignment>(`${BASE}/role-assignments/`, data),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/role-assignments/${id}/`),
  },

  // ── Invitations ──
  invitations: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<AccountInvitation>>(`${BASE}/invitations/`, { params }),
    create: (data: { email: string; company?: string; role?: string }) =>
      apiClient.post<AccountInvitation>(`${BASE}/invitations/`, data),
    cancel: (id: string) =>
      apiClient.post(`${BASE}/invitations/${id}/cancel/`),
    accept: (token: string, password: string) =>
      apiClient.post(`${BASE}/invitations/${token}/accept/`, { password }),
  },

  // ── MFA ──
  mfa: {
    list: () =>
      apiClient.get<AccountMFA[]>(`${BASE}/mfa/`),
    setup: (method: 'TOTP' | 'EMAIL') =>
      apiClient.post<{ qr_code?: string; backup_codes?: string[] }>(`${BASE}/mfa/setup/`, { method }),
    disable: (id: string) =>
      apiClient.delete(`${BASE}/mfa/${id}/`),
  },

  // ── Sessions ──
  sessions: {
    list: () =>
      apiClient.get<AccountSession[]>(`${BASE}/sessions/`),
    revoke: (id: string) =>
      apiClient.delete(`${BASE}/sessions/${id}/`),
    revokeAll: () =>
      apiClient.post(`${BASE}/sessions/revoke-all/`),
  },

  // ── Password Policy ──
  passwordPolicies: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<AccountPasswordPolicy>>(`${BASE}/password-policies/`, { params }),
    update: (id: string, data: Partial<AccountPasswordPolicy>) =>
      apiClient.patch<AccountPasswordPolicy>(`${BASE}/password-policies/${id}/`, data),
  },

  // ── Login Logs ──
  loginLogs: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<LoginLog>>(`${BASE}/login-logs/`, { params }),
  },
}
