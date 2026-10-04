import type { UUID, DateTimeString, DateString, DecimalString } from '@/api/types/common'

export type PayrollRunState = 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID'
export type PayslipState = 'DRAFT' | 'VERIFIED' | 'DONE'
export type WageCategory = 'EARNINGS' | 'DEDUCTIONS'

export interface PaySalaryStructure {
  id: UUID
  company: UUID
  name: string
  line_count: number
  is_active: boolean
}

export interface PayWageType {
  id: UUID
  company: UUID
  name: string
  code: string
  wage_type: 'BASIC' | 'ALLOWANCE' | 'DEDUCTION' | 'CONTRIBUTION' | 'TAX'
  category: WageCategory
  is_recurring: boolean
  is_active: boolean
}

export interface PayrollRun {
  id: UUID
  company: UUID
  name: string
  state: PayrollRunState
  period_from: DateString
  period_to: DateString
  payslip_count: number
  total_gross: DecimalString
  total_net: DecimalString
  created_at: DateTimeString
}

export interface Payslip {
  id: UUID
  employee: UUID
  employee_name: string
  payroll_run: UUID
  name: string
  date_from: DateString
  date_to: DateString
  amount_gross: DecimalString
  amount_deductions: DecimalString
  amount_net: DecimalString
  state: PayslipState
  bank_account: UUID | null
}

export interface PayslipLine {
  id: UUID
  payslip: UUID
  wage_type: UUID
  wage_type_name: string
  wage_type_code: string
  category: WageCategory
  amount: DecimalString
}

export interface PayTaxTable {
  id: UUID
  company: UUID
  name: string
  effective_from: DateString
  effective_to: DateString | null
  is_active: boolean
}
