import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function PurchaseHubPage() {
  return (
    <ModuleHub
      title="Purchase"
      breadcrumbs={[{ label: 'Purchase' }]}
      links={[
        {
          title: 'Purchase Orders',
          description: 'RFQs, supplier POs, and receiving.',
          path: '/purchase/orders',
        },
      ]}
    />
  )
}
