import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const AccountingHubPage = lazy(() =>
  import('@/modules/accounting/pages/AccountingHubPage').then((m) => ({ default: m.AccountingHubPage })),
)

export const Route = createFileRoute('/_app/accounting/')({
  component: () => (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <AccountingHubPage />
    </Suspense>
  ),
})
