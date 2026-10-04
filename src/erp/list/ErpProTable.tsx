import type { Key } from 'react'
import { ReloadOutlined } from '@ant-design/icons'
import { ProTable } from '@ant-design/pro-components'
import { Button } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'

export type { ProColumns as ErpProColumn }

interface ErpProTableProps<T extends object> {
  data: T[]
  columns: ColumnsType<T> | ProColumns<T>[]
  total?: number
  totalCount?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  loading?: boolean
  isLoading?: boolean
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  rowKey?: string | keyof T
  toolbar?: React.ReactNode
  headerTitle?: React.ReactNode
  onReload?: () => void
}

export function ErpProTable<T extends object>({
  data,
  columns,
  total,
  totalCount,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  loading,
  isLoading,
  selectable,
  onSelectionChange,
  onRowClick,
  rowKey = 'id' as keyof T,
  toolbar,
  headerTitle,
  emptyTitle = 'No records',
  emptyDescription = 'Try adjusting search or filters, or create a new record.',
  onReload,
}: ErpProTableProps<T>) {
  const resolvedTotal = totalCount ?? total ?? 0
  const resolvedLoading = isLoading ?? loading ?? false
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  const rowSelection = useMemo(() => {
    if (!selectable) return undefined
    return {
      selectedRowKeys,
      onChange: (keys: Key[], rows: T[]) => {
        setSelectedRowKeys(keys)
        onSelectionChange?.(rows)
      },
    }
  }, [selectable, selectedRowKeys, onSelectionChange])

  return (
    <ProTable<T>
      rowKey={rowKey as string}
      columns={columns as ProColumns<T>[]}
      dataSource={data}
      loading={resolvedLoading}
      search={false}
      options={{
        density: true,
        fullScreen: true,
        reload: false,
        setting: true,
      }}
      locale={{
        emptyText: (
          <div className="py-8 text-center">
            <p className="text-base font-medium text-neutral-800">{emptyTitle}</p>
            <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">{emptyDescription}</p>
          </div>
        ),
      }}
      headerTitle={headerTitle}
      toolBarRender={() => {
        const items: React.ReactNode[] = []
        if (onReload) {
          items.push(
            <Button key="reload" type="text" icon={<ReloadOutlined />} onClick={() => onReload()} />,
          )
        }
        if (toolbar) items.push(toolbar)
        return items
      }}
      pagination={{
        current: page,
        pageSize,
        total: resolvedTotal,
        showSizeChanger: true,
        onChange: (p, size) => {
          if (size !== pageSize) onPageSizeChange?.(size)
          else onPageChange?.(p)
        },
      }}
      rowSelection={rowSelection}
      onRow={(record) => ({
        onClick: onRowClick ? () => onRowClick(record) : undefined,
        style: onRowClick ? { cursor: 'pointer' } : undefined,
      })}
      cardBordered={false}
      ghost
    />
  )
}
