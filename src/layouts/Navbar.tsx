import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, Layout, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { notify } from '@/lib/notify'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { accountsApi } from '@/api/endpoints/accounts.api'

const { Header } = Layout

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const currentCompany = useAuthStore((s) => s.currentCompany)
  const companies = useAuthStore((s) => s.companies)
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany)
  const logout = useAuthStore((s) => s.logout)
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const notificationCount = useUIStore((s) => s.notificationCount)
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar)

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
    <Header className="!px-3 sm:!px-4 flex items-center gap-2 sm:gap-4 !h-14 !leading-normal border-b border-neutral-700">
      <Button
        type="text"
        className="lg:!hidden !text-white"
        icon={<MenuOutlined />}
        onClick={toggleMobileSidebar}
        aria-label="Open navigation menu"
      />

      {companies.length > 1 ? (
        <Dropdown menu={companyMenu} trigger={['click']}>
          <Button type="text" className="!text-white max-w-[180px]">
            <Space size="small">
              <Avatar size="small" className="!bg-brand-600">
                {currentCompany?.code?.[0] ?? 'C'}
              </Avatar>
              <Typography.Text ellipsis className="!text-white max-w-[120px]">
                {currentCompany?.name ?? 'Select Company'}
              </Typography.Text>
            </Space>
          </Button>
        </Dropdown>
      ) : (
        <Typography.Text ellipsis className="!text-neutral-300 max-w-[160px]">
          {currentCompany?.name ?? '—'}
        </Typography.Text>
      )}

      <div className="flex-1" />

      <Button
        type="text"
        className="hidden md:!inline-flex !text-neutral-400"
        icon={<SearchOutlined />}
        onClick={openCommandPalette}
      >
        Search…
      </Button>
      <Button
        type="text"
        className="md:!hidden !text-neutral-400"
        icon={<SearchOutlined />}
        onClick={openCommandPalette}
        aria-label="Open search"
      />

      <Badge count={notificationCount} size="small" overflowCount={99}>
        <Button
          type="text"
          className="!text-neutral-400"
          icon={<BellOutlined />}
          aria-label="Notifications"
        />
      </Badge>

      <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
        <Button type="text" className="!text-white">
          <Space>
            <Avatar src={user?.avatar_url} size="small">
              {user?.first_name?.[0]}
            </Avatar>
            <span className="hidden md:inline">{user?.first_name ?? 'User'}</span>
          </Space>
        </Button>
      </Dropdown>
    </Header>
  )
}
