import { useAuthStore } from '@/stores/auth.store'
import type { PermissionModel, PermissionAction } from '@/config/permissions'

/**
 * Check if the current user has a specific permission.
 *
 * Mirrors the backend GyroPermission logic:
 * - Superusers always return true
 * - No ModelPermission rows for this model → open (true)
 * - Otherwise check the specific action flag
 *
 * @example
 * const canCreate = usePermission('sales.SalesOrder', 'create')
 */
export function usePermission(model: PermissionModel, action: PermissionAction): boolean {
  return useAuthStore((s) => s.can(model, action))
}

/**
 * Returns all four permission flags for a model at once.
 * Useful when a component needs to conditionally render multiple action types.
 */
export function useModelPermissions(model: PermissionModel) {
  const can = useAuthStore((s) => s.can)
  return {
    canRead:   can(model, 'read'),
    canWrite:  can(model, 'write'),
    canCreate: can(model, 'create'),
    canDelete: can(model, 'delete'),
  }
}
