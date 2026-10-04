/** Centralized route path constants — avoids hard-coded strings in links. */

export const ROUTES = {
  // Auth
  LOGIN:             '/login',
  FORGOT_PASSWORD:   '/forgot-password',
  MFA_VERIFY:        '/mfa/verify',
  MFA_SETUP:         '/mfa/setup',
  OAUTH_CALLBACK:    '/oauth/callback',
  ACCEPT_INVITE:     '/invitations/:token/accept',

  // Dashboard
  DASHBOARD:         '/',

  // Settings (kernel)
  SETTINGS:          '/settings',
  SETTINGS_COMPANY:  '/settings/company',
  SETTINGS_USERS:    '/settings/users',
  SETTINGS_ROLES:    '/settings/roles',
  SETTINGS_API_KEYS: '/settings/api-keys',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_AI:       '/settings/ai',
  SETTINGS_EMAIL:    '/settings/email',
  SETTINGS_AUDIT:    '/settings/audit',
  PARTNERS:          '/partners',
  PARTNER_DETAIL:    '/partners/:id',

  // Inventory
  PRODUCTS:          '/inventory/products',
  PRODUCT_DETAIL:    '/inventory/products/:id',
  CATEGORIES:        '/inventory/categories',
  WAREHOUSES:        '/inventory/warehouses',
  LOCATIONS:         '/inventory/locations',
  STOCK_QUANTS:      '/inventory/stock',
  TRANSFERS:         '/inventory/transfers',
  TRANSFER_DETAIL:   '/inventory/transfers/:id',

  // Sales
  SALES_ORDERS:         '/sales/orders',
  SALES_ORDER_DETAIL:   '/sales/orders/:id',
  SALES_ORDER_NEW:      '/sales/orders/new',
  PRICELISTS:           '/sales/pricelists',
  PROMOTIONS:           '/sales/promotions',
  SALES_TEAMS:          '/sales/teams',
  COMMISSIONS:          '/sales/commissions',
  LOYALTY_PROGRAMS:     '/sales/loyalty',
  SALES_RETURNS:        '/sales/returns',
  SALES_FORECASTS:      '/sales/forecasts',

  // Purchase
  PURCHASE_ORDERS:       '/purchase/orders',
  PURCHASE_ORDER_DETAIL: '/purchase/orders/:id',
  PURCHASE_ORDER_NEW:    '/purchase/orders/new',
  REQUISITIONS:          '/purchase/requisitions',
  REQUISITION_DETAIL:    '/purchase/requisitions/:id',
  AGREEMENTS:            '/purchase/agreements',
  RFQ_CAMPAIGNS:         '/purchase/rfq',
  SUPPLIER_EVALUATIONS:  '/purchase/suppliers',
  PURCHASE_RETURNS:      '/purchase/returns',

  // Accounting
  CHART_OF_ACCOUNTS:  '/accounting/accounts',
  JOURNALS:           '/accounting/journals',
  INVOICES:           '/accounting/invoices',
  INVOICE_DETAIL:     '/accounting/invoices/:id',
  INVOICE_NEW:        '/accounting/invoices/new',
  BILLS:              '/accounting/bills',
  BILL_DETAIL:        '/accounting/bills/:id',
  PAYMENTS:           '/accounting/payments',
  BANK_STATEMENTS:    '/accounting/bank-statements',
  ANALYTIC_ACCOUNTS:  '/accounting/analytics',
  GL_REPORT:          '/accounting/reports/gl',
  TRIAL_BALANCE:      '/accounting/reports/trial-balance',

  // HR
  EMPLOYEES:           '/hr/employees',
  EMPLOYEE_DETAIL:     '/hr/employees/:id',
  EMPLOYEE_NEW:        '/hr/employees/new',
  DEPARTMENTS:         '/hr/departments',
  LEAVE_REQUESTS:      '/hr/leaves',
  LEAVE_ALLOCATIONS:   '/hr/leaves/allocations',
  PERFORMANCE_CYCLES:  '/hr/performance',
  APPRAISALS:          '/hr/appraisals',
  ONBOARDING:          '/hr/onboarding',
  INTERNAL_JOBS:       '/hr/jobs',
  ORG_CHART:           '/hr/org-chart',

  // Payroll
  SALARY_STRUCTURES:   '/payroll/structures',
  PAYROLL_RUNS:        '/payroll/runs',
  PAYROLL_RUN_DETAIL:  '/payroll/runs/:id',
  PAYSLIPS:            '/payroll/payslips',
  PAYSLIP_DETAIL:      '/payroll/payslips/:id',
  TAX_TABLES:          '/payroll/tax-tables',
  GARNISHMENTS:        '/payroll/garnishments',

  // Attendance
  SCHEDULES:           '/attendance/schedules',
  SHIFTS:              '/attendance/shifts',
  ATTENDANCE_RECORDS:  '/attendance/records',
  TIMESHEETS:          '/attendance/timesheets',
  TIMESHEET_DETAIL:    '/attendance/timesheets/:id',
  OVERTIME:            '/attendance/overtime',
  ATTENDANCE_ANALYTICS:'/attendance/analytics',

  // AI
  AI_CHAT:             '/ai/chat',
  AI_DOCUMENTS:        '/ai/documents',
  AI_PROVIDERS:        '/ai/providers',
  AI_USAGE:            '/ai/usage',
} as const
