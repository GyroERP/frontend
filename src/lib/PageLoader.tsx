import { Spin } from 'antd'
import { cn } from '@/lib/cn'

interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PageLoader({ size = 'md', className }: PageLoaderProps) {
  const heightClass = { sm: 'py-8', md: 'py-16', lg: 'h-64' }[size]
  return (
    <div className={cn('flex items-center justify-center', heightClass, className)}>
      <Spin size={size === 'sm' ? 'default' : 'large'} />
    </div>
  )
}

/** Standard Suspense fallback for route lazy loads. */
export function RouteSuspenseFallback() {
  return (
    <div className="flex items-center justify-center h-48">
      <Spin />
    </div>
  )
}
