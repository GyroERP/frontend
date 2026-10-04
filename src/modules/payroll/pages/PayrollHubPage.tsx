import { ModuleHub } from '@/erp/enterprise/ModuleHub'

export function PayrollHubPage() {
  return (
    <ModuleHub
      title="Payroll"
      breadcrumbs={[{ label: 'Payroll' }]}
      links={[
        {
          title: 'Payroll Runs',
          description: 'Period runs, payslips, and payments.',
          path: '/payroll/runs',
        },
      ]}
    />
  )
}
