/** ERP module registry — used by Sidebar and ModuleSwitcher */

export type ModuleStatus = 'active' | 'coming_soon'

export interface ERPModule {
  id: string
  label: string
  description: string
  icon: string          // Lucide icon name
  basePath: string
  status: ModuleStatus
  group: ModuleGroup
}

export type ModuleGroup =
  | 'core'
  | 'supply_chain'
  | 'finance'
  | 'people'
  | 'ai'
  | 'operations'

export const MODULES: ERPModule[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', description: 'Overview and KPIs', icon: 'LayoutDashboard', basePath: '/', status: 'active', group: 'core' },
  { id: 'kernel', label: 'Settings', description: 'Company, partners, master data', icon: 'Settings', basePath: '/settings', status: 'active', group: 'core' },

  // Supply Chain
  { id: 'inventory', label: 'Inventory', description: 'Products, warehouses, stock', icon: 'Package', basePath: '/inventory', status: 'active', group: 'supply_chain' },
  { id: 'sales', label: 'Sales', description: 'Orders, quotations, commissions', icon: 'ShoppingCart', basePath: '/sales', status: 'active', group: 'supply_chain' },
  { id: 'purchase', label: 'Purchase', description: 'POs, RFQs, supplier management', icon: 'Truck', basePath: '/purchase', status: 'active', group: 'supply_chain' },
  { id: 'crm', label: 'CRM', description: 'Leads, opportunities, pipeline', icon: 'Users', basePath: '/crm', status: 'coming_soon', group: 'supply_chain' },

  // Finance
  { id: 'accounting', label: 'Accounting', description: 'Invoices, payments, GL', icon: 'Calculator', basePath: '/accounting', status: 'active', group: 'finance' },
  { id: 'expenses', label: 'Expenses', description: 'Employee expense claims', icon: 'Receipt', basePath: '/expenses', status: 'coming_soon', group: 'finance' },

  // People
  { id: 'hr', label: 'Human Resources', description: 'Employees, org, performance', icon: 'UserCircle', basePath: '/hr', status: 'active', group: 'people' },
  { id: 'payroll', label: 'Payroll', description: 'Salary, payslips, tax', icon: 'Banknote', basePath: '/payroll', status: 'active', group: 'people' },
  { id: 'attendance', label: 'Attendance', description: 'Shifts, timesheets, overtime', icon: 'Clock', basePath: '/attendance', status: 'active', group: 'people' },
  { id: 'recruitment', label: 'Recruitment', description: 'Jobs, applications, interviews', icon: 'Briefcase', basePath: '/recruitment', status: 'coming_soon', group: 'people' },

  // Operations
  { id: 'manufacturing', label: 'Manufacturing', description: 'BOM, work orders, MRP', icon: 'Factory', basePath: '/manufacturing', status: 'coming_soon', group: 'operations' },
  { id: 'quality', label: 'Quality', description: 'QC checks, non-conformances', icon: 'CheckSquare', basePath: '/quality', status: 'coming_soon', group: 'operations' },
  { id: 'maintenance', label: 'Maintenance', description: 'Equipment, preventive tasks', icon: 'Wrench', basePath: '/maintenance', status: 'coming_soon', group: 'operations' },
  { id: 'projects', label: 'Projects', description: 'Tasks, milestones, timelines', icon: 'FolderKanban', basePath: '/projects', status: 'coming_soon', group: 'operations' },
  { id: 'helpdesk', label: 'Helpdesk', description: 'Tickets, SLA, escalations', icon: 'Headphones', basePath: '/helpdesk', status: 'coming_soon', group: 'operations' },
  { id: 'fleet', label: 'Fleet', description: 'Vehicles, fuel, maintenance', icon: 'Car', basePath: '/fleet', status: 'coming_soon', group: 'operations' },

  // AI
  { id: 'gyroai', label: 'GyroAI', description: 'AI assistant and document OCR', icon: 'Bot', basePath: '/ai', status: 'active', group: 'ai' },
]

export const MODULE_GROUPS: Record<ModuleGroup, { label: string; order: number }> = {
  core:         { label: 'Core', order: 0 },
  supply_chain: { label: 'Supply Chain', order: 1 },
  finance:      { label: 'Finance', order: 2 },
  people:       { label: 'People', order: 3 },
  operations:   { label: 'Operations', order: 4 },
  ai:           { label: 'AI', order: 5 },
}
