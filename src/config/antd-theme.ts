import type { ThemeConfig } from 'antd'

/** GyroERP brand theme — maps CSS tokens from globals.css to Ant Design. */
export const gyroTheme: ThemeConfig = {
  token: {
    colorPrimary: '#CC0000',
    colorLink: '#CC0000',
    colorLinkHover: '#A30000',
    borderRadius: 6,
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#000000',
      triggerBg: '#1A1A1A',
      headerBg: '#0D0D0D',
      bodyBg: '#FAFAFA',
    },
    Menu: {
      darkItemBg: '#000000',
      darkSubMenuItemBg: '#0D0D0D',
      darkItemSelectedBg: '#CC0000',
    },
    Table: {
      headerBg: '#F5F5F5',
    },
  },
}
