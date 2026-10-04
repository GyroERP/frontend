import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type { APIError } from './types/common'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,         // send session cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

/** Extract CSRF token from cookie — required for all state-mutating requests. */
function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match?.[1] ?? ''
}

/** Inject CSRF token on every mutating request. */
apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? 'GET'
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    config.headers['X-CSRFToken'] = getCsrfToken()
  }
  return config
})

/** Normalize API error responses. */
apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<APIError>) => {
    if (error.response?.status === 401) {
      // Session expired — redirect to login
      window.location.href = '/login?expired=1'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      // Normalize 403 for the UI to display a permission error
      error.message = error.response.data?.detail ?? 'You do not have permission to perform this action.'
    }

    if (error.response?.status === 429) {
      error.message = 'Too many requests. Please slow down.'
    }

    return Promise.reject(error)
  },
)

/** Helper to extract a human-readable error message from an API error. */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as APIError | undefined
    if (data?.detail) return data.detail
    if (data?.non_field_errors?.length) return data.non_field_errors.join(', ')
    // Return first field error found
    for (const key of Object.keys(data ?? {})) {
      const val = data?.[key]
      if (Array.isArray(val) && val.length > 0) return `${key}: ${val[0]}`
      if (typeof val === 'string') return `${key}: ${val}`
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export default apiClient
