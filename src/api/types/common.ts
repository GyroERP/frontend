/** Shared API response types — mirrors Django REST Framework conventions. */

export type UUID = string
export type DateString = string       // 'YYYY-MM-DD'
export type DateTimeString = string   // ISO 8601 UTC
export type DecimalString = string    // '1234.56'

/** Standard DRF paginated list response. */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Common API list query parameters. */
export interface ListParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  [key: string]: string | number | boolean | undefined
}

/** Backend error response shape. */
export interface APIError {
  detail?: string
  non_field_errors?: string[]
  [field: string]: string | string[] | undefined
}

/** Standard state choices from the backend. */
export type ActiveStatus = 'active' | 'inactive'
