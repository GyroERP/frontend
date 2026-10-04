import { useNavigate, useLocation } from '@tanstack/react-router'
import { Layout, Menu, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { ModuleIcon } from '@/config/module-icons'
import { useUIStore } from '@/stores/ui.store'
import { MODULES, MODULE_GROUPS, type ModuleGroup } from '@/config/modules'

const { Sider } = Layout

const ORDERED_GROUPS = Object.entries(MODULE_GROUPS)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key as ModuleGroup)

export function Sidebar() {
  const navigate = useNavigate()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar)
  const { pathname } = useLocation()
  const iconOnly = collapsed && !mobileOpen

  const selectedKey = useMemo(() => {
    const match = MODULES.find(
      (m) => pathname === m.basePath || (m.basePath !== '/' && pathname.startsWith(m.basePath)),
    )
    return match?.id ?? 'dashboard'
  }, [pathname])

  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = []
    for (const group of ORDERED_GROUPS) {
      const groupModules = MODULES.filter((m) => m.group === group)
      if (groupModules.length === 0) continue

      items.push({
        type: 'group',
        label: MODULE_GROUPS[group]?.label,
        children: groupModules.map((mod) => ({
          key: mod.id,
          icon: <ModuleIcon name={mod.icon} />,
          disabled: mod.status === 'coming_soon',
          label:
            mod.status === 'coming_soon' ? (
              iconOnly ? (
                <Tooltip title={`${mod.label} (Coming soon)`} placement="right">
                  <span>{mod.label}</span>
                </Tooltip>
              ) : (
                <span className="flex items-center justify-between gap-2">
                  <span>{mod.label}</span>
                  <Typography.Text type="secondary" className="text-xs">
                    Soon
                  </Typography.Text>
                </span>
              )
            ) : iconOnly ? (
              <Tooltip title={mod.label} placement="right">
                <span>{mod.label}</span>
              </Tooltip>
            ) : (
              mod.label
            ),
        })),
      })
    }
    return items
  }, [iconOnly])

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const mod = MODULES.find((m) => m.id === key)
    if (!mod || mod.status === 'coming_soon') return
    closeMobileSidebar()
    void navigate({ to: mod.basePath })
  }

  return (
    <Sider
      theme="dark"
      collapsible
      collapsed={iconOnly}
      trigger={null}
      width={256}
      collapsedWidth={64}
      className={`!fixed lg:!static inset-y-0 left-0 z-40 h-full transition-transform duration-200 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      aria-label="Main navigation"
    >
      <div
        className={`flex items-center h-14 px-4 border-b border-neutral-800 shrink-0 ${
          iconOnly ? 'justify-center px-2' : ''
        }`}
      >
        {iconOnly ? (
          <span className="text-lg font-bold text-brand-500">G</span>
        ) : (
          <span className="text-lg font-bold">
            <span className="text-brand-500">Gyro</span>
            <span className="text-white">ERP</span>
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={onMenuClick}
        className="border-r-0 flex-1 overflow-y-auto"
      />

      <div className="hidden lg:block border-t border-neutral-800 p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full h-8 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </button>
      </div>
    </Sider>
  )
}
