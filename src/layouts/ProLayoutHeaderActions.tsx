import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { notify } from '@/lib/notify'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { accountsApi } from '@/api/endpoints/accounts.api'

/** Right-side header actions for ProLayout (`actionsRender`). */
export function ProLayoutHeaderActions() {
  const user = useAuthStore((s) => s.user)
  const currentCompany = useAuthStore((s) => s.currentCompany)
  const companies = useAuthStore((s) => s.companies)
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany)
  const logout = useAuthStore((s) => s.logout)
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const notificationCount = useUIStore((s) => s.notificationCount)

  const handleLogout = async () => {
    try {
      await accountsApi.logout()
    } finally {
      logout()
      window.location.href = '/login'
    }
  }

  const companyMenu: MenuProps = {
    items: companies.map((co) => ({
      key: co.id,
      label: co.name,
      onClick: () => setCurrentCompany(co),
    })),
  }

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => notify.info('Profile coming soon'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        onClick: () => {
          window.location.href = '/settings'
        },
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign out',
        danger: true,
        onClick: () => void handleLogout(),
      },
    ],
  }

  return (
    <Space size="middle">
      {companies.length > 1 ? (
        <Dropdown menu={companyMenu} trigger={['click']}>
          <Button type="text" className="max-w-[180px]">
            <Space size="small">
              <Avatar size="small" className="!bg-[#CC0000]">
                {currentCompany?.code?.[0] ?? 'C'}
              </Avatar>
              <Typography.Text ellipsis className="max-w-[120px]">
                {currentCompany?.name ?? 'Select Company'}
              </Typography.Text>
            </Space>
          </Button>
        </Dropdown>
      ) : (
        <Typography.Text ellipsis className="max-w-[160px] !text-inherit">
          {currentCompany?.name ?? '—'}
        </Typography.Text>
      )}

      <Button
        type="text"
        icon={<SearchOutlined />}
        onClick={openCommandPalette}
        aria-label="Open search"
      />

      <Badge count={notificationCount} size="small" overflowCount={99}>
        <Button type="text" icon={<BellOutlined />} aria-label="Notifications" />
      </Badge>

      <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
        <Button type="text">
          <Space>
            <Avatar src={user?.avatar_url} size="small">
              {user?.first_name?.[0]}
            </Avatar>
            <span className="hidden md:inline">{user?.first_name ?? 'User'}</span>
          </Space>
        </Button>
      </Dropdown>
    </Space>
  )
}
