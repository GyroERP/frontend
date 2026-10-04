import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PageShell, type BreadcrumbItem } from '@/erp/enterprise/PageShell'
import { PermissionGuard } from '@/erp/enterprise/PermissionGuard'
import { ErpProTable } from '@/erp/list/ErpProTable'
import type { ListController } from '@/erp/hooks/use-list-controller'
import type { PermissionAction, PermissionModel } from '@/config/permissions'

interface ListPageProps<T extends object> {
  title: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  controller: ListController<T>
  columns: ColumnsType<T>
  searchPlaceholder?: string
  searchable?: boolean
  createLabel?: string
  onCreate?: () => void
  onRowClick?: (row: T) => void
  actions?: React.ReactNode
  toolbar?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  createPermission?: { model: PermissionModel; action?: PermissionAction }
}

export function ListPage<T extends object>({
  title,
  breadcrumbs,
  controller,
  columns,
  searchPlaceholder = 'Search…',
  searchable = true,
  createLabel,
  onCreate,
  onRowClick,
  actions,
  toolbar,
  emptyTitle = 'No records',
  emptyDescription = 'Try adjusting search or filters, or create a new record.',
  createPermission,
}: ListPageProps<T>) {
  const createButton =
    createLabel && onCreate ? (
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        {createLabel}
      </Button>
    ) : null
  return (
    <PageShell
      title={title}
      breadcrumbs={breadcrumbs}
      actions={
        <Space wrap>
          {actions}
          {createPermission ? (
            <PermissionGuard model={createPermission.model} action={createPermission.action ?? 'create'}>
              {createButton}
            </PermissionGuard>
          ) : (
            createButton
          )}
        </Space>
      }
    >
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {searchable && (
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={searchPlaceholder}
              value={controller.search}
              onChange={(e) => controller.setSearch(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[280px]"
            />
          )}
          {toolbar}
        </div>
      )}

      <ErpProTable
        columns={columns}
        data={controller.rows}
        isLoading={controller.isLoading}
        totalCount={controller.total}
        page={controller.page}
        pageSize={controller.pageSize}
        onPageChange={controller.setPage}
        onPageSizeChange={controller.setPageSize}
        onReload={() => void controller.query.refetch()}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onRowClick={onRowClick}
      />
    </PageShell>
  )
}
