import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MFAVerifyPage } from '@/modules/auth/pages/MFAVerifyPage'

export const Route = createFileRoute('/mfa')({
  component: () => (
    <AuthLayout>
      <MFAVerifyPage />
    </AuthLayout>
  ),
})
