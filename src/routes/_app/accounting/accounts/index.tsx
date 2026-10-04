import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const ChartOfAccountsPage = lazy(() =>
  import('@/modules/accounting/pages/ChartOfAccountsPage').then((m) => ({ default: m.ChartOfAccountsPage })),
)

export const Route = createFileRoute('/_app/accounting/accounts/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <ChartOfAccountsPage />
    </Suspense>
  ),
})
