import { Avatar, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from '@tanstack/react-router'
import { hrKeys } from '../api/keys'
import { useListController } from '@/erp/hooks/use-list-controller'
import { ListPage } from '@/erp/list/ListPage'
import type { HrEmployee } from '../api/types'

const columns: ColumnsType<HrEmployee> = [
  {
    title: 'Employee',
    dataIndex: 'full_name',
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar_url ?? undefined} size="small">
          {row.full_name.charAt(0)}
        </Avatar>
        <div>
          <p className="font-medium text-neutral-800">{row.full_name}</p>
          <p className="text-xs text-neutral-400">{row.employee_number}</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Position',
    dataIndex: 'position_name',
    render: (position: string | null) => (
      <span className="text-sm text-neutral-600">{position ?? '—'}</span>
    ),
  },
  {
    title: 'Department',
    dataIndex: 'department_name',
    render: (department: string | null) => (
      <span className="text-sm text-neutral-600">{department ?? '—'}</span>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'employment_type',
    render: (type: string) => <Tag>{type}</Tag>,
  },
  {
    title: 'Location',
    dataIndex: 'work_location',
    render: (location: string) => (
      <span className="text-sm text-neutral-500">{location}</span>
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

export function EmployeeListPage() {
  const navigate = useNavigate()
  const controller = useListController<HrEmployee>({
    queryKey: (p) => hrKeys.employeeList(p),
    url: '/hr/employees/',
  })

  return (
    <ListPage
      title="Employees"
      breadcrumbs={[{ label: 'HR' }, { label: 'Employees' }]}
      controller={controller}
      columns={columns}
      searchPlaceholder="Search employees…"
      createLabel="New Employee"
      onCreate={() => navigate({ to: '/hr/employees/$id', params: { id: 'new' } })}
      onRowClick={(row) => navigate({ to: '/hr/employees/$id', params: { id: row.id } })}
    />
  )
}
