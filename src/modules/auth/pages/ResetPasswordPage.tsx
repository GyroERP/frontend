import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Input } from 'antd'
import { resetPasswordSchema, type ResetPasswordForm } from '../schemas'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { extractErrorMessage } from '@/api/client'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token = '', uid = '' } = useSearch({ strict: false }) as { token?: string; uid?: string }
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordForm) {
    setError(null)
    setIsPending(true)
    try {
      await accountsApi.resetPassword({ token, uid, new_password: data.new_password })
      navigate({ to: '/login', search: { reset: '1' } })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsPending(false)
    }
  }

  if (!token || !uid) {
    return (
      <div className="space-y-5 text-center">
        <Alert
          type="error"
          showIcon
          message="Invalid or expired reset link. Please request a new one."
        />
        <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline block">
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-neutral-800">Set new password</h1>
        <p className="text-sm text-neutral-400 mt-1">Choose a strong password for your account.</p>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">New password</label>
        <Controller
          name="new_password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              autoFocus
              prefix={<Lock className="size-4 text-neutral-400" />}
              status={errors.new_password ? 'error' : undefined}
            />
          )}
        />
        {errors.new_password?.message && (
          <p className="text-xs text-red-500">{errors.new_password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Confirm new password</label>
        <Controller
          name="confirm_password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              prefix={<Lock className="size-4 text-neutral-400" />}
              status={errors.confirm_password ? 'error' : undefined}
            />
          )}
        />
        {errors.confirm_password?.message && (
          <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
        )}
      </div>

      <Button type="primary" htmlType="submit" block size="large" loading={isPending}>
        Set password
      </Button>

      <p className="text-center text-sm text-neutral-400">
        <Link to="/login" className="text-brand-600 hover:text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
