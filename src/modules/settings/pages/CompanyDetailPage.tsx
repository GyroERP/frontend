import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SaveOutlined } from '@ant-design/icons'
import { ProForm, ProFormText } from '@ant-design/pro-components'
import { Alert, Skeleton } from 'antd'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { kernelKeys } from '@/api/query-keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { useCompanyId } from '@/hooks/use-company'
import { useAuthStore } from '@/stores/auth.store'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import { useMemo } from 'react'

export function CompanyDetailPage() {
  const queryClient = useQueryClient()
  const companyId = useCompanyId()
  const companies = useAuthStore((s) => s.companies)
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany)

  const { data, isLoading } = useQuery({
    queryKey: kernelKeys.company(companyId ?? ''),
    queryFn: () => kernelApi.companies.get(companyId!),
    enabled: !!companyId,
    staleTime: 60_000,
  })

  const company = data?.data

  const initialValues = useMemo(
    () =>
      company
        ? {
            name: company.name,
            code: company.code,
            email: company.email ?? '',
            phone: company.phone ?? '',
            vat: company.vat ?? '',
            street: company.street ?? '',
            city: company.city ?? '',
            zip_code: company.zip_code ?? '',
            timezone: company.timezone,
          }
        : undefined,
    [company],
  )

  const save = useMutation({
    mutationFn: (d: NonNullable<typeof initialValues>) => kernelApi.companies.update(companyId!, d),
    onSuccess: () => {
      notify.success('Company settings saved')
      void queryClient.invalidateQueries({ queryKey: kernelKeys.companies() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  if (!companyId) {
    return (
      <PageShell title="Company Settings" breadcrumbs={[{ label: 'Settings' }, { label: 'Company' }]}>
        <div className="max-w-2xl">
          <Alert
            type="info"
            showIcon
            message="No company selected"
            description={
              companies.length > 0 ? (
                <>
                  Choose a company from the header menu, or{' '}
                  <button
                    type="button"
                    className="text-[#CC0000] underline"
                    onClick={() => setCurrentCompany(companies[0]!)}
                  >
                    use {companies[0]!.name}
                  </button>
                  .
                </>
              ) : (
                'Your session has no company yet. Reload the page or sign in again so the app can load company data.'
              )
            }
          />
        </div>
      </PageShell>
    )
  }

  if (isLoading || !initialValues) {
    return (
      <PageShell title="Company" breadcrumbs={[{ label: 'Settings' }, { label: 'Company' }]}>
        <div className="mx-auto space-y-4 max-w-2xl">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} active style={{ width: '100%', height: 40 }} />
          ))}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Company Settings"
      breadcrumbs={[{ label: 'Settings' }, { label: 'Company' }]}
    >
      <ProForm
        key={companyId}
        initialValues={initialValues}
        submitter={{
          searchConfig: { submitText: 'Save' },
          submitButtonProps: { icon: <SaveOutlined />, loading: save.isPending },
          resetButtonProps: { style: { display: 'none' } },
        }}
        onFinish={async (values) => {
          await save.mutateAsync(values as NonNullable<typeof initialValues>)
          return true
        }}
        className="max-w-2xl"
      >
        <ProForm.Group title="General">
          <ProFormText name="name" label="Company Name" rules={[{ required: true }]} colProps={{ span: 24 }} />
          <ProFormText name="code" label="Code" rules={[{ required: true }]} colProps={{ span: 12 }} />
          <ProFormText name="vat" label="VAT Number" colProps={{ span: 12 }} />
          <ProFormText name="email" label="Email" colProps={{ span: 12 }} rules={[{ type: 'email' }]} />
          <ProFormText name="phone" label="Phone" colProps={{ span: 12 }} />
          <ProFormText name="timezone" label="Timezone" placeholder="e.g. Africa/Cairo" colProps={{ span: 24 }} />
        </ProForm.Group>
        <ProForm.Group title="Address">
          <ProFormText name="street" label="Street" colProps={{ span: 24 }} />
          <ProFormText name="city" label="City" colProps={{ span: 12 }} />
          <ProFormText name="zip_code" label="ZIP / Postal Code" colProps={{ span: 12 }} />
        </ProForm.Group>
      </ProForm>
    </PageShell>
  )
}
