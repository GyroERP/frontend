import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { attendanceKeys } from '../api/keys'
import { PageShell, FilterBar } from '@/erp/enterprise/PageShell'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate, formatDateTime } from '@/lib/date'
import { apiClient } from '@/api/client'
import type { AttAttendanceRecord } from '../api/types'
import type { PaginatedResponse } from '@/api/types/common'

const STATUS_TAG_COLOR: Record<string, string> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  EARLY_LEAVE: 'warning',
  ON_LEAVE: 'default',
}

const columns: ColumnsType<AttAttendanceRecord> = [
  {
    title: 'Employee',
    dataIndex: 'employee_name',
    render: (name: string) => <span className="font-medium text-neutral-700">{name}</span>,
  },
  {
    title: 'Date',
    dataIndex: 'date',
    render: (date: string) => (
      <span className="text-sm text-neutral-600">{formatDate(date)}</span>
    ),
  },
  {
    title: 'Check In',
    dataIndex: 'check_in',
    render: (checkIn: string) => (
      <span className="text-sm text-neutral-600 font-mono">
        {checkIn ? formatDateTime(checkIn) : '—'}
      </span>
    ),
  },
  {
    title: 'Check Out',
    dataIndex: 'check_out',
    render: (checkOut: string) => (
      <span className="text-sm text-neutral-600 font-mono">
        {checkOut ? formatDateTime(checkOut) : '—'}
      </span>
    ),
  },
  {
    title: 'Hours',
    dataIndex: 'worked_hours',
    render: (hours: string) => (
      <span className="text-sm text-neutral-700">{hours ?? '—'}</span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => (
      <Tag color={STATUS_TAG_COLOR[status] ?? 'default'}>{status}</Tag>
    ),
  },
]

export function AttendanceRecordsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: attendanceKeys.records({ search: debouncedSearch, page, date_from: dateFrom, date_to: dateTo }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<AttAttendanceRecord>>('/attendance/records/', {
        params: {
          search: debouncedSearch || undefined,
          page,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      }),
    staleTime: 30_000,
  })

  return (
    <PageShell
      title="Attendance Records"
      breadcrumbs={[{ label: 'Attendance' }, { label: 'Records' }]}
    >
      <FilterBar>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search employee…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-56"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </FilterBar>
      <ErpProTable
        columns={columns}
        data={data?.data.results ?? []}
        isLoading={isLoading}
        totalCount={data?.data.count ?? 0}
        page={page}
        pageSize={25}
        onPageChange={setPage}
      />
    </PageShell>
  )
}
