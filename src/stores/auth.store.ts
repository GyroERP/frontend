import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/api/types/accounts'
import type { Company } from '@/api/types/kernel'
import type { PermissionModel, PermissionAction } from '@/config/permissions'

interface PermissionMap {
  [modelName: string]: {
    can_read: boolean
    can_write: boolean
    can_create: boolean
    can_delete: boolean
  }
}

interface AuthState {
  user: User | null
  currentCompany: Company | null
  companies: Company[]
  permissions: PermissionMap
  isAuthenticated: boolean
  mfaPending: boolean

  // Actions
  setUser: (user: User) => void
  setCurrentCompany: (company: Company) => void
  setCompanies: (companies: Company[]) => void
  setPermissions: (permissions: PermissionMap) => void
  setMfaPending: (pending: boolean) => void
  logout: () => void

  // Permission check helper
  can: (model: PermissionModel, action: PermissionAction) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentCompany: null,
      companies: [],
      permissions: {},
      isAuthenticated: false,
      mfaPending: false,

      setUser: (user) => set({ user, isAuthenticated: true, mfaPending: false }),

      setCurrentCompany: (company) => set({ currentCompany: company }),

      setCompanies: (companies) => {
        const { currentCompany } = get()
        // If no company selected yet, default to first
        if (!currentCompany && companies.length > 0) {
          set({ companies, currentCompany: companies[0] ?? null })
        } else {
          set({ companies })
        }
      },

      setPermissions: (permissions) => set({ permissions }),

      setMfaPending: (pending) => set({ mfaPending: pending }),

      logout: () =>
        set({
          user: null,
          currentCompany: null,
          companies: [],
          permissions: {},
          isAuthenticated: false,
          mfaPending: false,
        }),

      can: (model, action) => {
        const { user, permissions } = get()
        // Superusers bypass all permission checks
        if (user?.is_superuser) return true
        const perm = permissions[model]
        // No ModelPermission rows for this model → open (allow)
        if (!perm) return true
        switch (action) {
          case 'read':   return perm.can_read
          case 'write':  return perm.can_write
          case 'create': return perm.can_create
          case 'delete': return perm.can_delete
        }
      },
    }),
    {
      name: 'gyroerp-auth',
      // Only persist non-sensitive state
      partialize: (state) => ({
        currentCompany: state.currentCompany,
        companies: state.companies,
      }),
    },
  ),
)
