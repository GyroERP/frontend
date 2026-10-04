import { Outlet } from '@tanstack/react-router'

interface AuthLayoutProps {
  children?: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps = {}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <span className="text-4xl font-bold text-brand-600">Gyro</span>
            <span className="text-4xl font-bold text-neutral-800">ERP</span>
          </div>
          <p className="text-sm text-neutral-400">Enterprise Resource Planning</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-8">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  )
}
