import { useAuthStore } from '@/stores/auth.store'
import type { Company } from '@/api/types/kernel'

/** Returns the currently active company. Throws if used outside auth context. */
export function useCurrentCompany(): Company {
  const company = useAuthStore((s) => s.currentCompany)
  if (!company) throw new Error('useCurrentCompany called before company is set')
  return company
}

/** Returns the current company's UUID, or null if not set. */
export function useCompanyId(): string | null {
  return useAuthStore((s) => s.currentCompany?.id ?? null)
}

/** Returns the current company's timezone string (defaults to 'UTC'). */
export function useTimezone(): string {
  return useAuthStore((s) => s.currentCompany?.timezone ?? 'UTC')
}

/** Returns the current company's currency code (defaults to 'USD'). */
export function useCurrencyCode(): string {
  return useAuthStore((s) => s.currentCompany?.currency_code ?? 'USD')
}
