import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SaveOutlined } from '@ant-design/icons'
import { ProDescriptions, ProForm, ProFormText } from '@ant-design/pro-components'
import { Avatar, Skeleton, Tabs, Tag } from 'antd'
import { hrKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { apiClient } from '@/api/client'
import { extractErrorMessage } from '@/api/client'
import { notify } from '@/lib/notify'
import { formatDate } from '@/lib/date'
import type { HrEmployee, HrLeaveRequest } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

interface EmployeeDetailPageProps {
  employeeId: string
}

const LEAVE_TAG: Record<string, string> = {
  APPROVED: 'success',
  REFUSED: 'error',
}

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const queryClient = useQueryClient()
  const isNew = employeeId === 'new'
  const [activeTab, setActiveTab] = useState('profile')

  const { data, isLoading } = useQuery({
    queryKey: hrKeys.employee(employeeId),
    queryFn: () => apiClient.get<HrEmployee>(`/hr/employees/${employeeId}/`),
    enabled: !isNew,
    staleTime: 60_000,
  })

  const { data: leaveData } = useQuery({
    queryKey: hrKeys.leaves({ employee: employeeId }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<HrLeaveRequest>>('/hr/leave-requests/', {
        params: { employee: employeeId, page_size: 25 },
      }),
    enabled: !isNew && activeTab === 'leave',
    staleTime: 30_000,
  })

  const employee = data?.data

  const initialValues = useMemo(
    () =>
      employee
        ? {
            first_name: employee.first_name,
            last_name: employee.last_name,
            work_email: employee.work_email,
            phone: employee.phone ?? '',
          }
        : { first_name: '', last_name: '', work_email: '', phone: '' },
    [employee],
  )

  const save = useMutation({
    mutationFn: (d: typeof initialValues) =>
      isNew
        ? apiClient.post<HrEmployee>('/hr/employees/', d)
        : apiClient.patch<HrEmployee>(`/hr/employees/${employeeId}/`, d),
    onSuccess: () => {
      notify.success('Employee saved')
      void queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
    onError: (err) => notify.error(extractErrorMessage(err)),
  })

  if (!isNew && isLoading) {
    return (
      <PageShell title="Loading…" breadcrumbs={[{ label: 'HR', href: '/hr/employees' }, { label: '…' }]}>
        <div className="mx-auto space-y-4 max-w-2xl">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} active style={{ width: '100%', height: 40 }} />
          ))}
        </div>
      </PageShell>
    )
  }

  const leaveRequests = leaveData?.data.results ?? []

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <div className="space-y-6 pt-2 max-w-2xl">
          <ProForm
            key={employee?.id ?? 'new'}
            initialValues={initialValues}
            submitter={{
              searchConfig: { submitText: 'Save' },
              submitButtonProps: { icon: <SaveOutlined />, loading: save.isPending },
              resetButtonProps: { style: { display: 'none' } },
            }}
            onFinish={async (values) => {
              await save.mutateAsync(values as typeof initialValues)
              return true
            }}
          >
            <ProForm.Group title="Personal Info">
              <ProFormText name="first_name" label="First Name" rules={[{ required: true }]} colProps={{ span: 12 }} />
              <ProFormText name="last_name" label="Last Name" rules={[{ required: true }]} colProps={{ span: 12 }} />
              <ProFormText
                name="work_email"
                label="Work Email"
                rules={[{ required: true }, { type: 'email' }]}
                colProps={{ span: 12 }}
              />
              <ProFormText name="phone" label="Phone" colProps={{ span: 12 }} />
            </ProForm.Group>
          </ProForm>

          {employee && (
            <ProDescriptions
              title="Employment Details"
              column={2}
              dataSource={employee}
              columns={[
                { title: 'Employee #', dataIndex: 'employee_number' },
                { title: 'Department', dataIndex: 'department_name', render: (v) => v ?? '—' },
                { title: 'Position', dataIndex: 'position_name', render: (v) => v ?? '—' },
                { title: 'Manager', dataIndex: 'manager_name', render: (v) => v ?? '—' },
                { title: 'Join Date', dataIndex: 'date_of_join', render: (v) => formatDate(String(v)) },
                { title: 'Location', dataIndex: 'work_location' },
              ]}
            />
          )}
        </div>
      ),
    },
    {
      key: 'leave',
      label: 'Leave',
      children: (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">From</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Days</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                      No leave requests
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id} className="border-b border-neutral-50">
                      <td className="px-4 py-3">{req.leave_type_name}</td>
                      <td className="px-4 py-3 text-neutral-500">{formatDate(req.request_date_from)}</td>
                      <td className="px-4 py-3 text-neutral-500">{formatDate(req.request_date_to)}</td>
                      <td className="px-4 py-3">{req.number_of_days}</td>
                      <td className="px-4 py-3">
                        <Tag color={LEAVE_TAG[req.state] ?? 'warning'}>{req.state}</Tag>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      key: 'documents',
      label: 'Documents',
      children: (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center text-neutral-400 pt-2">
          Document management — attach via attachment API
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title={
        <span className="flex items-center gap-3">
          {employee && (
            <Avatar src={employee.avatar_url ?? undefined} size="small">
              {employee.full_name.charAt(0)}
            </Avatar>
          )}
          {employee?.full_name ?? 'New Employee'}
        </span>
      }
      breadcrumbs={[
        { label: 'HR', href: '/hr/employees' },
        { label: employee?.full_name ?? 'New Employee' },
      ]}
    >
      <div className="mx-auto max-w-4xl">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="mb-6" />
      </div>
    </PageShell>
  )
}
