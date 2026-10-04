import { useEffect } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { LoginForm, ProFormText } from '@ant-design/pro-components'
import apiClient from '@/api/client'
import { loginSchema } from '../schemas'
import { useLogin } from '../hooks'

export function LoginPage() {
  const { mutate: login, isPending } = useLogin()

  useEffect(() => {
    void apiClient.get('/accounts/login/').catch(() => {})
  }, [])

  return (
    <LoginForm
      title="Welcome back"
      subTitle="Sign in to your GyroERP account"
      onFinish={async (values) => {
        const parsed = loginSchema.safeParse(values)
        if (!parsed.success) return false
        login(parsed.data)
        return true
      }}
      submitter={{ submitButtonProps: { loading: isPending, size: 'large' } }}
    >
      <ProFormText
        name="username"
        fieldProps={{ size: 'large', prefix: <UserOutlined />, autoComplete: 'username' }}
        placeholder="Username or email"
        rules={[{ required: true, message: 'Username is required' }]}
      />
      <ProFormText.Password
        name="password"
        fieldProps={{ size: 'large', prefix: <LockOutlined />, autoComplete: 'current-password' }}
        placeholder="Password"
        rules={[{ required: true, message: 'Password is required' }]}
      />
      <div className="flex justify-end mb-2">
        <a href="/forgot-password" className="text-sm text-[#CC0000] hover:underline">
          Forgot password?
        </a>
      </div>
    </LoginForm>
  )
}
