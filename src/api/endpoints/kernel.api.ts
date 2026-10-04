import apiClient from '../client'
import type { PaginatedResponse, ListParams } from '../types/common'
import type {
  Company, Partner, Currency, Country, CountryState,
  Language, Attachment, APIKey, AuditLog, GyroMessage,
} from '../types/kernel'

const BASE = '/kernel'

export const kernelApi = {
  // ── Companies ──
  companies: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Company>>(`${BASE}/companies/`, { params }),
    get: (id: string) =>
      apiClient.get<Company>(`${BASE}/companies/${id}/`),
    update: (id: string, data: Partial<Company>) =>
      apiClient.patch<Company>(`${BASE}/companies/${id}/`, data),
    create: (data: Partial<Company>) =>
      apiClient.post<Company>(`${BASE}/companies/`, data),
  },

  // ── Partners ──
  partners: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Partner>>(`${BASE}/partners/`, { params }),
    get: (id: string) =>
      apiClient.get<Partner>(`${BASE}/partners/${id}/`),
    create: (data: Partial<Partner>) =>
      apiClient.post<Partner>(`${BASE}/partners/`, data),
    update: (id: string, data: Partial<Partner>) =>
      apiClient.patch<Partner>(`${BASE}/partners/${id}/`, data),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/partners/${id}/`),
  },

  // ── Attachments ──
  attachments: {
    list: (params: { content_type?: string; object_id?: string } & ListParams) =>
      apiClient.get<PaginatedResponse<Attachment>>(`${BASE}/attachments/`, { params }),
    upload: (formData: FormData) =>
      apiClient.post<Attachment>(`${BASE}/attachments/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/attachments/${id}/`),
  },

  // ── API Keys ──
  apiKeys: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<APIKey>>(`${BASE}/api-keys/`, { params }),
    create: (data: Partial<APIKey>) =>
      apiClient.post<{ instance: APIKey; raw_key: string }>(`${BASE}/api-keys/`, data),
    revoke: (id: string) =>
      apiClient.delete(`${BASE}/api-keys/${id}/`),
  },

  // ── Audit Log ──
  auditLog: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<AuditLog>>(`${BASE}/audit-log/`, { params }),
  },

  // ── GyroLogger messages (chatter) ──
  messages: {
    list: (params: { content_type: string; object_id: string } & ListParams) =>
      apiClient.get<PaginatedResponse<GyroMessage>>(`${BASE}/messages/`, { params }),
    create: (data: {
      content_type: string
      object_id: string
      message_type: 'comment' | 'note'
      body: string
      mentioned_user_ids?: string[]
    }) => apiClient.post<GyroMessage>(`${BASE}/messages/`, data),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/messages/${id}/`),
  },

  // ── Master Data ──
  currencies: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Currency>>(`${BASE}/currencies/`, { params }),
  },
  countries: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Country>>(`${BASE}/countries/`, { params }),
  },
  countryStates: {
    list: (params?: ListParams & { country?: string }) =>
      apiClient.get<PaginatedResponse<CountryState>>(`${BASE}/country-states/`, { params }),
  },
  languages: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<Language>>(`${BASE}/languages/`, { params }),
  },
}
