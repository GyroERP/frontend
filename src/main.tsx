/// <reference types="vite/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { App as AntApp, ConfigProvider, Spin } from 'antd'
import { ProConfigProvider } from '@ant-design/pro-components'

import { routeTree } from './routeTree.gen'
import { ModuleErrorFallback } from '@/erp/enterprise/ModuleErrorFallback'
import { gyroTheme } from '@/config/antd-theme'
import '@/lib/i18n'

import 'antd/dist/reset.css'
import '@/styles/globals.css'
import '@/styles/print.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } }).response?.status
        if (status !== undefined && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: ModuleErrorFallback,
  defaultPendingComponent: () => (
    <div className="flex justify-center py-16">
      <Spin size="large" />
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root element not found in DOM')

createRoot(rootEl).render(
  <StrictMode>
    <ConfigProvider theme={gyroTheme}>
      <ProConfigProvider hashed={import.meta.env.PROD}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </AntApp>
      </ProConfigProvider>
    </ConfigProvider>
  </StrictMode>,
)
