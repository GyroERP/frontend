import { Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from '@tanstack/react-router'
import { kernelKeys } from '@/api/query-keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import type { Partner } from '@/api/types/kernel'

const PARTNER_TYPE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  SUPPLIER: 'Supplier',
  BOTH: 'Customer & Supplier',
  EMPLOYEE: 'Employee',
}

const columns: ColumnsType<Partner> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (_, row) => (
      <div>
        <p className="font-medium text-neutral-800">{row.name}</p>
        {row.email && <p className="text-xs text-neutral-400">{row.email}</p>}
      </div>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'partner_type',
    render: (type: string) => (
      <Tag>{PARTNER_TYPE_LABELS[type] ?? type}</Tag>
    ),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    render: (phone: string) => (
      <span className="text-sm text-neutral-600">{phone ?? '—'}</span>
    ),
  },
  {
    title: 'Country',
    dataIndex: 'country_name',
    render: (country: string) => (
      <span className="text-sm text-neutral-600">{country ?? '—'}</span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    render: (active: boolean) => (
      <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
    ),
  },
]

export function PartnerListPage() {
  const navigate = useNavigate()
  const controller = useListController<Partner>({
    queryKey: (p) => kernelKeys.partnerList(p),
    url: '/kernel/partners/',
  })

  return (
    <ListPage
      title="Partners"
      breadcrumbs={[{ label: 'Contacts' }, { label: 'Partners' }]}
      controller={controller}
      columns={columns}
      searchPlaceholder="Search partners…"
      createLabel="New Partner"
      onCreate={() => navigate({ to: '/partners/$id', params: { id: 'new' } })}
      onRowClick={(row) => navigate({ to: '/partners/$id', params: { id: row.id } })}
    />
  )
}
