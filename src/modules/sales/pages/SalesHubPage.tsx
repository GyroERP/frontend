import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function SalesHubPage() {
  return (
    <ModuleHub
      title="Sales"
      breadcrumbs={[{ label: 'Sales' }]}
      links={[
        {
          title: 'Sales Orders',
          description: 'Quotations, confirmations, and order fulfillment.',
          path: '/sales/orders',
        },
      ]}
    />
  )
}
