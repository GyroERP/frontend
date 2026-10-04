import type { UUID, DateTimeString, DateString, DecimalString } from '@/api/types/common'

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
export type JournalType = 'SALE' | 'PURCHASE' | 'GENERAL' | 'BANK' | 'CASH'
export type MoveState = 'DRAFT' | 'POSTED' | 'CANCELLED'
export type MoveType =
  | 'CUSTOMER_INVOICE' | 'CUSTOMER_REFUND'
  | 'VENDOR_BILL' | 'VENDOR_REFUND'
  | 'GENERAL'
export type PaymentState = 'DRAFT' | 'POSTED' | 'SENT' | 'RECEIVED' | 'CANCELLED'
export type PaymentType = 'INBOUND' | 'OUTBOUND'

export interface Account {
  id: UUID
  company: UUID
  code: string
  name: string
  account_type: AccountType
  group: UUID | null
  group_name: string | null
  reconcile: boolean
  is_active: boolean
}

export interface AccountJournal {
  id: UUID
  company: UUID
  code: string
  name: string
  journal_type: JournalType
  default_account: UUID | null
  default_account_name: string | null
  is_active: boolean
}

export interface AccountMove {
  id: UUID
  company: UUID
  journal: UUID
  journal_name: string
  name: string
  date: DateString
  posted_date: DateTimeString | null
  state: MoveState
  move_type: MoveType
  partner: UUID | null
  partner_name: string | null
  ref: string | null
  invoice_date: DateString | null
  due_date: DateString | null
  payment_term: UUID | null
  payment_term_name: string | null
  amount_untaxed: DecimalString
  amount_tax: DecimalString
  amount_total: DecimalString
  amount_residual: DecimalString   // outstanding balance
  currency: UUID
  currency_code: string
  narration: string | null
  line_count: number
  created_at: DateTimeString
}

export interface AccountMoveLine {
  id: UUID
  move: UUID
  account: UUID
  account_code: string
  account_name: string
  name: string
  debit: DecimalString
  credit: DecimalString
  quantity: DecimalString | null
  partner: UUID | null
  partner_name: string | null
}

export interface Tax {
  id: UUID
  company: UUID
  name: string
  code: string
  amount_type: 'FIXED' | 'PERCENT' | 'GROUP'
  amount: DecimalString
  is_active: boolean
}

export interface AccountPayment {
  id: UUID
  company: UUID
  partner: UUID
  partner_name: string
  payment_date: DateString
  state: PaymentState
  payment_type: PaymentType
  partner_type: 'CUSTOMER' | 'SUPPLIER'
  amount: DecimalString
  currency: UUID
  currency_code: string
  journal: UUID
  journal_name: string
  created_at: DateTimeString
}

export interface AccountBankStatement {
  id: UUID
  company: UUID
  journal: UUID
  journal_name: string
  name: string
  date: DateString
  balance_start: DecimalString
  balance_end_real: DecimalString
  balance_end: DecimalString
  line_count: number
}

export interface AnalyticAccount {
  id: UUID
  company: UUID
  code: string
  name: string
  parent: UUID | null
  parent_name: string | null
  is_active: boolean
}
