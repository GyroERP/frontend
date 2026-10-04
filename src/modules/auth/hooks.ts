import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { notify } from '@/lib/notify'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { accountsKeys } from '@/api/query-keys'
import { useAuthStore } from '@/stores/auth.store'
import { extractErrorMessage } from '@/api/client'
import type { LoginForm, MFAForm } from './schemas'

export function useLogin() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setCompanies = useAuthStore((s) => s.setCompanies)
  const setMfaPending = useAuthStore((s) => s.setMfaPending)

  return useMutation({
    mutationFn: (data: LoginForm) => accountsApi.login(data),
    onSuccess: async (res) => {
      const { user, mfa_required } = res.data
      if (mfa_required) {
        setMfaPending(true)
        void navigate({ to: '/mfa' })
      } else {
        setUser(user)
        try {
          const companiesRes = await kernelApi.companies.list({ page_size: 100 })
          setCompanies(companiesRes.data.results)
        } catch {
          // Non-fatal — bootstrap loader in _app will retry
        }
        void navigate({ to: '/' })
      }
    },
    onError: (err) => {
      notify.error(extractErrorMessage(err))
    },
  })
}

export function useMFAVerify() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const setCompanies = useAuthStore((s) => s.setCompanies)

  return useMutation({
    mutationFn: (data: MFAForm) => accountsApi.mfaVerify(data),
    onSuccess: async () => {
      const meRes = await accountsApi.me()
      setUser(meRes.data)
      const companiesRes = await kernelApi.companies.list({ page_size: 100 })
      setCompanies(companiesRes.data.results)
      void queryClient.invalidateQueries({ queryKey: accountsKeys.me() })
      void navigate({ to: '/' })
    },
    onError: (err) => {
      notify.error(extractErrorMessage(err))
    },
  })
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: accountsKeys.me(),
    queryFn: () => accountsApi.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBootstrapAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const setCompanies = useAuthStore((s) => s.setCompanies)

  return useQuery({
    queryKey: ['bootstrap'],
    queryFn: async () => {
      const [meRes, companiesRes] = await Promise.all([
        accountsApi.me(),
        kernelApi.companies.list({ page_size: 100 }),
      ])
      setUser(meRes.data)
      setCompanies(companiesRes.data.results)
      return meRes.data
    },
    retry: false,
    staleTime: Infinity,
  })
}
