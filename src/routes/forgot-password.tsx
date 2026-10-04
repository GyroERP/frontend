import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'

export const Route = createFileRoute('/forgot-password')({
  component: () => (
    <AuthLayout>
      <ForgotPasswordPage />
    </AuthLayout>
  ),
})
