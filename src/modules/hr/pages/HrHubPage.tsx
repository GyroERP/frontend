import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function HrHubPage() {
  return (
    <ModuleHub
      title="Human Resources"
      breadcrumbs={[{ label: 'HR' }]}
      links={[
        {
          title: 'Employees',
          description: 'Employee records, contracts, and leave.',
          path: '/hr/employees',
        },
      ]}
    />
  )
}
