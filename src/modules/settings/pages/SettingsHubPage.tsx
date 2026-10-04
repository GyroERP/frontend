import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function SettingsHubPage() {
  return (
    <ModuleHub
      title="Settings"
      breadcrumbs={[{ label: 'Settings' }]}
      links={[
        {
          title: 'Company',
          description: 'Legal entity, currency, and fiscal settings.',
          path: '/settings/company',
        },
        {
          title: 'Partners',
          description: 'Customers, vendors, and contacts.',
          path: '/partners',
        },
        {
          title: 'API Keys',
          description: 'Integrations and programmatic access.',
          path: '/settings/api-keys',
        },
      ]}
    />
  )
}
