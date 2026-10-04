import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function AccountingHubPage() {
  return (
    <ModuleHub
      title="Accounting"
      breadcrumbs={[{ label: 'Accounting' }]}
      links={[
        {
          title: 'Customer Invoices',
          description: 'Outgoing invoices and receivables.',
          path: '/accounting/invoices',
        },
        {
          title: 'Vendor Bills',
          description: 'Incoming bills and payables.',
          path: '/accounting/bills',
        },
        {
          title: 'Chart of Accounts',
          description: 'GL accounts and structure.',
          path: '/accounting/accounts',
        },
      ]}
    />
  )
}
