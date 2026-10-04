/** Backend model name constants for ModelPermission checks.
 *  Format: '<app_label>.<ModelName>'
 */

export const PERMISSIONS = {
  // accounts
  USER:             'accounts.User',
  ROLE:             'accounts.AccountRole',
  INVITATION:       'accounts.AccountInvitation',
  MFA:              'accounts.AccountMFA',
  API_KEY:          'gyrokernel.APIKey',
  SESSION:          'accounts.AccountSession',

  // gyrokernel
  COMPANY:          'gyrokernel.Company',
  PARTNER:          'gyrokernel.Partner',
  ATTACHMENT:       'gyrokernel.Attachment',
  AUDIT_LOG:        'gyrokernel.AuditLog',
  MODEL_PERMISSION: 'gyrokernel.ModelPermission',
  RECORD_RULE:      'gyrokernel.RecordRule',

  // inventory
  PRODUCT:          'inventory.ProductTemplate',
  PRODUCT_VARIANT:  'inventory.ProductVariant',
  PRODUCT_CATEGORY: 'inventory.ProductCategory',
  WAREHOUSE:        'inventory.Warehouse',
  STOCK_LOCATION:   'inventory.StockLocation',
  STOCK_PICKING:    'inventory.StockPicking',
  STOCK_QUANT:      'inventory.StockQuant',

  // sales
  SALES_ORDER:      'sales.SalesOrder',
  PRICELIST:        'sales.SalesPricelist',
  PROMOTION:        'sales.SalesPromotion',
  SALES_TEAM:       'sales.SalesTeam',
  COMMISSION_PLAN:  'sales.SalesCommissionPlan',
  LOYALTY_PROGRAM:  'sales.SalesLoyaltyProgram',

  // purchase
  PURCHASE_ORDER:   'purchase.PurchaseOrder',
  REQUISITION:      'purchase.PurchaseRequisition',
  AGREEMENT:        'purchase.PurchaseAgreement',
  RFQ:              'purchase.PurchaseRFQCampaign',

  // accounting
  ACCOUNT:          'accounting.Account',
  JOURNAL:          'accounting.AccountJournal',
  MOVE:             'accounting.AccountMove',
  PAYMENT:          'accounting.AccountPayment',
  TAX:              'accounting.Tax',
  BANK_STATEMENT:   'accounting.AccountBankStatement',
  ANALYTIC_ACCOUNT: 'accounting.AnalyticAccount',

  // hr
  EMPLOYEE:         'hr.HrEmployee',
  DEPARTMENT:       'hr.HrDepartment',
  LEAVE_REQUEST:    'hr.HrLeaveRequest',
  LEAVE_ALLOCATION: 'hr.HrLeaveAllocation',
  APPRAISAL:        'hr.HrAppraisal',
  GOAL:             'hr.HrGoal',
  ONBOARDING:       'hr.HrOnboardingRecord',

  // payroll
  SALARY_STRUCTURE: 'payroll.PaySalaryStructure',
  PAYROLL_RUN:      'payroll.PayrollRun',
  PAYSLIP:          'payroll.Payslip',

  // attendance
  ATTENDANCE_RECORD:   'attendance.AttAttendanceRecord',
  TIMESHEET:           'attendance.AttTimesheet',
  SHIFT:               'attendance.AttShift',
  OVERTIME_REQUEST:    'attendance.AttOvertimeRequest',

  // gyroai
  AI_CONVERSATION:  'gyroai.AIConversation',
  AI_DOCUMENT:      'gyroai.AIDocument',
  AI_PROVIDER:      'gyroai.AIProvider',
  AI_USAGE:         'gyroai.AIUsageLog',
} as const

export type PermissionModel = typeof PERMISSIONS[keyof typeof PERMISSIONS]
export type PermissionAction = 'read' | 'write' | 'create' | 'delete'
