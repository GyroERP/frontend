import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if ((context as { isAuthenticated?: boolean }).isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  ),
})
