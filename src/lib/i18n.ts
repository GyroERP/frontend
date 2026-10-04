import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app: {
        name: 'GyroERP',
        search: 'Search',
        commandPalettePlaceholder: 'Search pages, products, orders, partners…',
      },
      nav: {
        dashboard: 'Dashboard',
        skipToContent: 'Skip to main content',
      },
      list: {
        emptyTitle: 'No records',
        emptyDescription: 'Try adjusting search or filters, or create a new record.',
        searchPlaceholder: 'Search…',
      },
      errors: {
        boundaryTitle: 'Something went wrong',
        tryAgain: 'Try again',
        copyError: 'Copy error',
        viewFullscreen: 'View full screen',
      },
    },
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
