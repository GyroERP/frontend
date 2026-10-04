import { ProLayout } from '@ant-design/pro-components'
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { buildProLayoutMenu, selectedMenuKey } from '@/config/pro-layout-routes'
import { ProLayoutHeaderActions } from '@/layouts/ProLayoutHeaderActions'
import { CommandPalette } from '@/layouts/CommandPalette'
import { useUIStore } from '@/stores/ui.store'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface AppLayoutProps {
  children?: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps = {}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)

  const { t } = useTranslation()
  const mainRef = useRef<HTMLElement | null>(null)
  const menuData = useMemo(() => buildProLayoutMenu(), [])
  const selectedKeys = useMemo(() => [selectedMenuKey(pathname)], [pathname])

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (main) {
      main.focus({ preventScroll: true })
      mainRef.current = main
    }
  }, [pathname])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#CC0000] focus:text-white focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {t('nav.skipToContent')}
      </a>
      <ProLayout
        title="GyroERP"
        logo={
          <span className="text-lg font-bold whitespace-nowrap">
            <span className="text-[#CC0000]">Gyro</span>
            <span className="text-white">ERP</span>
          </span>
        }
        layout="mix"
        fixSiderbar
        siderWidth={256}
        collapsed={collapsed}
        onCollapse={setSidebarCollapsed}
        breakpoint="lg"
        location={{ pathname }}
        route={{ path: '/', routes: menuData }}
        menu={{ locale: false, defaultOpenAll: false }}
        selectedKeys={selectedKeys}
        menuItemRender={(item, dom) => {
          if (!item.path || item.disabled) return dom
          return (
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault()
                void navigate({ to: item.path! })
              }}
            >
              {dom}
            </a>
          )
        }}
        actionsRender={() => [<ProLayoutHeaderActions key="actions" />]}
        token={{
          header: {
            colorBgHeader: '#0D0D0D',
            colorHeaderTitle: '#fff',
            colorTextMenu: '#d4d4d4',
            colorTextMenuSelected: '#fff',
            colorBgMenuItemSelected: '#CC0000',
            heightLayoutHeader: 56,
          },
          sider: {
            colorMenuBackground: '#000000',
            colorBgMenuItemSelected: '#CC0000',
            colorTextMenuSelected: '#fff',
            colorTextMenu: '#d4d4d4',
          },
          pageContainer: {
            colorBgPageContainer: '#FAFAFA',
          },
        }}
      >
        <div id="main-content" tabIndex={-1} className="min-h-[calc(100vh-56px)]">
          {children ?? <Outlet />}
        </div>
      </ProLayout>
      <CommandPalette />
    </>
  )
}
