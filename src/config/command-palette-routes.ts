/** Static navigation targets for the command palette (modules + frequent pages). */
export interface CommandPaletteRoute {
  id: string
  label: string
  path: string
  group: string
  keywords?: string
}

export const COMMAND_PALETTE_ROUTES: CommandPaletteRoute[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', group: 'Core' },
  { id: 'settings-company', label: 'Company Settings', path: '/settings/company', group: 'Settings', keywords: 'company profile' },
  { id: 'partners', label: 'Partners', path: '/partners', group: 'Settings' },
  { id: 'api-keys', label: 'API Keys', path: '/settings/api-keys', group: 'Settings' },
  { id: 'inventory', label: 'Inventory Overview', path: '/inventory', group: 'Inventory' },
  { id: 'products', label: 'Products', path: '/inventory/products', group: 'Inventory' },
  { id: 'transfers', label: 'Transfers', path: '/inventory/transfers', group: 'Inventory' },
  { id: 'stock', label: 'Stock', path: '/inventory/stock', group: 'Inventory' },
  { id: 'warehouses', label: 'Warehouses', path: '/inventory/warehouses', group: 'Inventory' },
  { id: 'lots', label: 'Lots / Serials', path: '/inventory/lots', group: 'Inventory' },
  { id: 'attributes', label: 'Product Attributes', path: '/inventory/attributes', group: 'Inventory' },
  { id: 'sales-orders', label: 'Sales Orders', path: '/sales/orders', group: 'Sales' },
  { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase/orders', group: 'Purchase' },
  { id: 'invoices', label: 'Customer Invoices', path: '/accounting/invoices', group: 'Accounting' },
  { id: 'bills', label: 'Vendor Bills', path: '/accounting/bills', group: 'Accounting' },
  { id: 'coa', label: 'Chart of Accounts', path: '/accounting/accounts', group: 'Accounting' },
  { id: 'employees', label: 'Employees', path: '/hr/employees', group: 'HR' },
  { id: 'attendance', label: 'Attendance', path: '/attendance/records', group: 'HR' },
  { id: 'payroll-runs', label: 'Payroll Runs', path: '/payroll/runs', group: 'Payroll' },
  { id: 'ai-chat', label: 'GyroAI Chat', path: '/ai/chat', group: 'AI' },
  { id: 'ai-ocr', label: 'Document OCR', path: '/ai/documents', group: 'AI' },
]
