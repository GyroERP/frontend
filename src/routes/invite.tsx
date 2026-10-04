import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { InviteAcceptPage } from '@/modules/auth/pages/InviteAcceptPage'

export const Route = createFileRoute('/invite')({
  component: () => (
    <AuthLayout>
      <InviteAcceptPage />
    </AuthLayout>
  ),
})
