import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  /** Mobile (<lg) off-canvas sidebar visibility — not persisted. */
  mobileSidebarOpen: boolean
  theme: Theme
  commandPaletteOpen: boolean
  notificationCount: number

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  setTheme: (theme: Theme) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  setNotificationCount: (count: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      theme: 'light',
      commandPaletteOpen: false,
      notificationCount: 0,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleMobileSidebar: () =>
        set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),

      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

      setTheme: (theme) => {
        set({ theme })
        // Apply to document immediately
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // System preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.toggle('dark', prefersDark)
        }
      },

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      setNotificationCount: (count) => set({ notificationCount: count }),
    }),
    {
      name: 'gyroerp-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
)
