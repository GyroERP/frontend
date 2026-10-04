import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { accountingKeys } from '../api/keys'
import { PageShell } from '@/erp/enterprise/PageShell'
import { ErpProTable } from '@/erp/list/ErpProTable'
import { useListController } from '@/erp/hooks/use-list-controller'
import type { Account } from '../api/types'

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  ASSET: 'processing',
  LIABILITY: 'warning',
  EQUITY: 'success',
  INCOME: 'success',
  EXPENSE: 'error',
}

export function ChartOfAccountsPage() {
  const navigate = useNavigate()
  const controller = useListController<Account>({
    queryKey: (p) => accountingKeys.accounts(p),
    url: '/accounting/accounts/',
    staleTime: 60_000,
  })

  const columns: ColumnsType<Account> = useMemo(
    () => [
      {
        title: 'Code',
        dataIndex: 'code',
        render: (code: string) => (
          <span className="font-mono text-sm font-medium text-neutral-700">{code}</span>
        ),
      },
      {
        title: 'Account Name',
        dataIndex: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'account_type',
        render: (type: string) => (
          <Tag color={ACCOUNT_TYPE_COLORS[type] ?? 'default'}>{type}</Tag>
        ),
      },
      {
        title: 'Reconcile',
        dataIndex: 'reconcile',
        render: (reconcile: boolean) => (reconcile ? 'Yes' : 'No'),
      },
      {
        title: 'Status',
        dataIndex: 'is_active',
        render: (active: boolean) => (
          <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
        ),
      },
    ],
    [],
  )

  return (
    <PageShell
      title="Chart of Accounts"
      breadcrumbs={[{ label: 'Accounting' }, { label: 'Chart of Accounts' }]}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate({ to: '/accounting/accounts' })}
        >
          New Account
        </Button>
      }
    >
      <div className="mb-4">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by code or name…"
          value={controller.search}
          onChange={(e) => controller.setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <ErpProTable
        columns={columns}
        data={controller.rows}
        isLoading={controller.isLoading}
        totalCount={controller.total}
        page={controller.page}
        pageSize={controller.pageSize}
        onPageChange={controller.setPage}
        onRowClick={() => navigate({ to: '/accounting/accounts' })}
      />
    </PageShell>
  )
}
