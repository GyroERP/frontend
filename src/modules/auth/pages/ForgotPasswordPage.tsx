import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Input } from 'antd'
import { forgotPasswordSchema, type ForgotPasswordForm } from '../schemas'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { extractErrorMessage } from '@/api/client'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordForm) {
    setError(null)
    setIsPending(true)
    try {
      await accountsApi.forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsPending(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-neutral-800">Check your inbox</h1>
          <p className="text-sm text-neutral-400 mt-1">
            We sent a password reset link to your email address.
          </p>
        </div>
        <Alert type="success" showIcon message="If that email is in our system, you'll receive a link shortly." />
        <Button type="text" block onClick={() => navigate({ to: '/login' })}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-neutral-800">Reset your password</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Email address</label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              autoComplete="email"
              autoFocus
              prefix={<Mail className="size-4 text-neutral-400" />}
              status={errors.email ? 'error' : undefined}
            />
          )}
        />
        {errors.email?.message && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="primary" htmlType="submit" block size="large" loading={isPending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-neutral-400">
        Remember your password?{' '}
        <Link to="/login" className="text-brand-600 hover:text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
