import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage'

export const Route = createFileRoute('/reset-password')({
  component: () => (
    <AuthLayout>
      <ResetPasswordPage />
    </AuthLayout>
  ),
})
