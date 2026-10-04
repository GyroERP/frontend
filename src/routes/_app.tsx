import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { useAuthStore } from '@/stores/auth.store'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { kernelApi } from '@/api/endpoints/kernel.api'

export const Route = createFileRoute('/_app')({
  loader: async () => {
    const { isAuthenticated, companies, currentCompany } = useAuthStore.getState()

    // Already bootstrapped — skip API calls, but ensure a company is selected
    if (isAuthenticated && companies.length > 0) {
      if (!currentCompany) {
        useAuthStore.getState().setCurrentCompany(companies[0]!)
      }
      return
    }

    try {
      const meRes = await accountsApi.me()
      useAuthStore.getState().setUser(meRes.data)
    } catch {
      throw redirect({ to: '/login' })
    }

    // Load companies if not already in store (best-effort)
    if (useAuthStore.getState().companies.length === 0) {
      try {
        const companiesRes = await kernelApi.companies.list({ page_size: 100 })
        useAuthStore.getState().setCompanies(companiesRes.data.results)
      } catch {
        // Not fatal — navbar shows "—" until company is available
      }
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
