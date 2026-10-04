import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import {
  ProForm,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components'
import { Button, Modal, Skeleton } from 'antd'
import { kernelApi } from '@/api/endpoints/kernel.api'
import { kernelKeys } from '@/api/query-keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import { useMemo, useState } from 'react'

interface PartnerDetailPageProps {
  partnerId: string
}

export function PartnerDetailPage({ partnerId }: PartnerDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = partnerId === 'new'
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: kernelKeys.partner(partnerId),
    queryFn: () => kernelApi.partners.get(partnerId),
    enabled: !isNew,
    staleTime: 60_000,
  })

  const partner = data?.data

  const initialValues = useMemo(
    () =>
      partner
        ? {
            name: partner.name,
            code: partner.code ?? '',
            email: partner.email ?? '',
            phone: partner.phone ?? '',
            website: partner.website ?? '',
            street: partner.street ?? '',
            city: partner.city ?? '',
            zip: partner.zip ?? '',
            is_active: partner.is_active,
          }
        : {
            name: '',
            code: '',
            email: '',
            phone: '',
            website: '',
            street: '',
            city: '',
            zip: '',
            is_active: true,
          },
    [partner],
  )

  const save = useMutation({
    mutationFn: (values: typeof initialValues) =>
      isNew ? kernelApi.partners.create(values) : kernelApi.partners.update(partnerId, values),
    onSuccess: (res) => {
      notify.success(isNew ? 'Partner created' : 'Changes saved')
      void queryClient.invalidateQueries({ queryKey: kernelKeys.partners() })
      if (isNew) {
        void navigate({ to: '/partners/$id', params: { id: res.data.id } })
      }
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: () => kernelApi.partners.delete(partnerId),
    onSuccess: () => {
      notify.success('Partner deleted')
      void queryClient.invalidateQueries({ queryKey: kernelKeys.partners() })
      void navigate({ to: '/partners' })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  if (!isNew && isLoading) {
    return (
      <PageShell title="Loading…" breadcrumbs={[{ label: 'Partners', href: '/partners' }, { label: '…' }]}>
        <div className="mx-auto space-y-4 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} active style={{ width: '100%', height: 40 }} />
          ))}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={isNew ? 'New Partner' : (partner?.name ?? 'Partner')}
      breadcrumbs={[
        { label: 'Partners', href: '/partners' },
        { label: isNew ? 'New' : (partner?.name ?? '') },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      }
    >
      <ProForm
        key={partner?.id ?? 'new'}
        initialValues={initialValues}
        submitter={{
          searchConfig: { submitText: isNew ? 'Create' : 'Save' },
          submitButtonProps: { icon: <SaveOutlined />, loading: save.isPending },
          resetButtonProps: { style: { display: 'none' } },
        }}
        onFinish={async (values) => {
          await save.mutateAsync(values as typeof initialValues)
          return true
        }}
        className="max-w-2xl"
      >
        <ProForm.Group title="General">
          <ProFormText name="name" label="Name" rules={[{ required: true }]} colProps={{ span: 24 }} />
          <ProFormText name="code" label="Code" colProps={{ span: 12 }} />
          <ProFormText
            name="email"
            label="Email"
            colProps={{ span: 12 }}
            rules={[{ type: 'email', message: 'Invalid email' }]}
          />
          <ProFormText name="phone" label="Phone" colProps={{ span: 12 }} />
          <ProFormText
            name="website"
            label="Website"
            colProps={{ span: 12 }}
            rules={[{ type: 'url', message: 'Invalid URL' }]}
          />
        </ProForm.Group>
        <ProForm.Group title="Address">
          <ProFormText name="street" label="Street" colProps={{ span: 24 }} />
          <ProFormText name="city" label="City" colProps={{ span: 12 }} />
          <ProFormText name="zip" label="ZIP Code" colProps={{ span: 12 }} />
        </ProForm.Group>
        <ProFormSwitch
          name="is_active"
          label="Active"
          extra="Inactive partners are hidden from selectors"
        />
      </ProForm>

      <Modal
        open={deleteOpen}
        title="Delete partner"
        okText="Delete"
        okButtonProps={{ danger: true, loading: remove.isPending }}
        onCancel={() => setDeleteOpen(false)}
        onOk={() => remove.mutate()}
      >
        Delete &quot;{partner?.name}&quot;? This cannot be undone.
      </Modal>
    </PageShell>
  )
}
