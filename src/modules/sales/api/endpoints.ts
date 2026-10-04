import apiClient from '@/api/client'
import type { PaginatedResponse, ListParams } from '@/api/types/common'
import type {
  SalesOrder, SalesOrderLine, SalesPricelist, SalesTeam,
  SalesCommissionEntry, SalesLoyaltyCard, SalesReturn, SalesForecast,
} from './types'

const BASE = '/sales'

export const salesApi = {
  orders: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesOrder>>(`${BASE}/orders/`, { params }),
    get: (id: string) =>
      apiClient.get<SalesOrder>(`${BASE}/orders/${id}/`),
    create: (data: Partial<SalesOrder>) =>
      apiClient.post<SalesOrder>(`${BASE}/orders/`, data),
    update: (id: string, data: Partial<SalesOrder>) =>
      apiClient.patch<SalesOrder>(`${BASE}/orders/${id}/`, data),
    confirm: (id: string) =>
      apiClient.post<SalesOrder>(`${BASE}/orders/${id}/confirm/`),
    cancel: (id: string) =>
      apiClient.post<SalesOrder>(`${BASE}/orders/${id}/cancel/`),
    send: (id: string) =>
      apiClient.post<SalesOrder>(`${BASE}/orders/${id}/send/`),
  },

  orderLines: {
    list: (params?: ListParams & { order?: string }) =>
      apiClient.get<PaginatedResponse<SalesOrderLine>>(`${BASE}/order-lines/`, { params }),
    create: (data: Partial<SalesOrderLine>) =>
      apiClient.post<SalesOrderLine>(`${BASE}/order-lines/`, data),
    update: (id: string, data: Partial<SalesOrderLine>) =>
      apiClient.patch<SalesOrderLine>(`${BASE}/order-lines/${id}/`, data),
    delete: (id: string) =>
      apiClient.delete(`${BASE}/order-lines/${id}/`),
  },

  pricelists: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesPricelist>>(`${BASE}/pricelists/`, { params }),
    get: (id: string) =>
      apiClient.get<SalesPricelist>(`${BASE}/pricelists/${id}/`),
    create: (data: Partial<SalesPricelist>) =>
      apiClient.post<SalesPricelist>(`${BASE}/pricelists/`, data),
    update: (id: string, data: Partial<SalesPricelist>) =>
      apiClient.patch<SalesPricelist>(`${BASE}/pricelists/${id}/`, data),
  },

  teams: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesTeam>>(`${BASE}/teams/`, { params }),
    get: (id: string) =>
      apiClient.get<SalesTeam>(`${BASE}/teams/${id}/`),
    create: (data: Partial<SalesTeam>) =>
      apiClient.post<SalesTeam>(`${BASE}/teams/`, data),
    update: (id: string, data: Partial<SalesTeam>) =>
      apiClient.patch<SalesTeam>(`${BASE}/teams/${id}/`, data),
  },

  commissionEntries: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesCommissionEntry>>(`${BASE}/commission-entries/`, { params }),
  },

  loyaltyCards: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesLoyaltyCard>>(`${BASE}/loyalty-cards/`, { params }),
    get: (id: string) =>
      apiClient.get<SalesLoyaltyCard>(`${BASE}/loyalty-cards/${id}/`),
  },

  returns: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesReturn>>(`${BASE}/returns/`, { params }),
    get: (id: string) =>
      apiClient.get<SalesReturn>(`${BASE}/returns/${id}/`),
    create: (data: Partial<SalesReturn>) =>
      apiClient.post<SalesReturn>(`${BASE}/returns/`, data),
  },

  forecasts: {
    list: (params?: ListParams) =>
      apiClient.get<PaginatedResponse<SalesForecast>>(`${BASE}/forecasts/`, { params }),
    create: (data: Partial<SalesForecast>) =>
      apiClient.post<SalesForecast>(`${BASE}/forecasts/`, data),
    update: (id: string, data: Partial<SalesForecast>) =>
      apiClient.patch<SalesForecast>(`${BASE}/forecasts/${id}/`, data),
  },
}
