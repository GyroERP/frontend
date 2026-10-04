import { usePermission } from '@/hooks/use-permission'
import type { PermissionModel, PermissionAction } from '@/config/permissions'

interface PermissionGuardProps {
  model: PermissionModel
  action: PermissionAction
  children: React.ReactNode
  /** Rendered when the user lacks permission. Defaults to null (renders nothing). */
  fallback?: React.ReactNode
}

/**
 * Conditionally renders children based on ModelPermission checks.
 *
 * NOTE: This is a UI convenience — the real security gate is always the backend.
 * Never rely on this alone for security; the API will reject unauthorized requests.
 *
 * @example
 * <PermissionGuard model={PERMISSIONS.SALES_ORDER} action="create">
 *   <Button onClick={handleCreate}>New Order</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({ model, action, children, fallback = null }: PermissionGuardProps) {
  const allowed = usePermission(model, action)
  return allowed ? <>{children}</> : <>{fallback}</>
}
