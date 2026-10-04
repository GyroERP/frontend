import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Lock, User } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Input } from 'antd'
import { inviteAcceptSchema, type InviteAcceptForm } from '../schemas'
import { accountsApi } from '@/api/endpoints/accounts.api'
import { extractErrorMessage } from '@/api/client'

export function InviteAcceptPage() {
  const navigate = useNavigate()
  const { token = '' } = useSearch({ strict: false }) as { token?: string }
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteAcceptForm>({ resolver: zodResolver(inviteAcceptSchema) })

  async function onSubmit(data: InviteAcceptForm) {
    setError(null)
    setIsPending(true)
    try {
      await accountsApi.acceptInvitation({ token, ...data })
      navigate({ to: '/login', search: { invited: '1' } })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsPending(false)
    }
  }

  if (!token) {
    return (
      <Alert
        type="error"
        showIcon
        message="Invalid invitation link. Please contact your administrator."
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-neutral-800">Accept invitation</h1>
        <p className="text-sm text-neutral-400 mt-1">Set up your account to join GyroERP.</p>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Full name</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              autoComplete="name"
              autoFocus
              prefix={<User className="size-4 text-neutral-400" />}
              status={errors.name ? 'error' : undefined}
            />
          )}
        />
        {errors.name?.message && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Password</label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              prefix={<Lock className="size-4 text-neutral-400" />}
              status={errors.password ? 'error' : undefined}
            />
          )}
        />
        {errors.password?.message && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">Confirm password</label>
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
        Create account
      </Button>
    </form>
  )
}
