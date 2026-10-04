import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteSuspenseFallback } from '@/lib/PageLoader'

const AccountMoveDetailPage = lazy(() =>
  import('@/modules/accounting/pages/AccountMoveDetailPage').then((m) => ({
    default: m.AccountMoveDetailPage,
  })),
)

export const Route = createFileRoute('/_app/accounting/moves/$id')({
  component: function AccountingMoveRoute() {
    const { id } = Route.useParams()
    return (
      <Suspense fallback={<RouteSuspenseFallback />}>
        <AccountMoveDetailPage moveId={id} listPath="/accounting/invoices" title="Invoices" />
      </Suspense>
    )
  },
})
