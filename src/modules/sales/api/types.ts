import type { UUID, DateTimeString, DateString, DecimalString } from '@/api/types/common'

export type SalesOrderState = 'DRAFT' | 'SENT' | 'APPROVED' | 'SALE' | 'DONE' | 'CANCELLED'
export type DeliveryStatus = 'NOTHING' | 'PENDING' | 'PARTIAL' | 'FULL'
export type InvoiceStatus = 'NOTHING' | 'TO_INVOICE' | 'INVOICED' | 'UPSELLING'

export interface SalesOrder {
  id: UUID
  company: UUID
  name: string
  client_order_ref: string | null
  partner: UUID
  partner_name: string
  partner_invoice: UUID | null
  partner_shipping: UUID | null
  pricelist: UUID | null
  pricelist_name: string | null
  payment_term: UUID | null
  payment_term_name: string | null
  user: UUID | null
  user_name: string | null
  team: UUID | null
  team_name: string | null
  state: SalesOrderState
  confirmation_date: DateTimeString | null
  date_order: DateTimeString
  commitment_date: DateTimeString | null
  delivery_status: DeliveryStatus
  invoice_status: InvoiceStatus
  amount_untaxed: DecimalString
  amount_tax: DecimalString
  amount_total: DecimalString
  currency: UUID
  currency_code: string
  note: string | null
  created_at: DateTimeString
}

export interface SalesOrderLine {
  id: UUID
  order: UUID
  variant: UUID
  variant_name: string
  name: string
  description: string | null
  product_qty: DecimalString
  product_uom: UUID
  product_uom_name: string
  price_unit: DecimalString
  price_subtotal: DecimalString
  qty_delivered: DecimalString
  qty_invoiced: DecimalString
  qty_to_invoice: DecimalString
  sequence: number
}

export interface SalesPricelist {
  id: UUID
  company: UUID
  name: string
  currency: UUID
  currency_code: string
  is_active: boolean
  sequence: number
}

export interface SalesTeam {
  id: UUID
  company: UUID
  name: string
  code: string
  member_count: number
  is_active: boolean
}

export interface SalesCommissionEntry {
  id: UUID
  order: UUID
  order_name: string
  employee: UUID
  employee_name: string
  plan: UUID
  plan_name: string
  state: 'DRAFT' | 'CALCULATED' | 'PAID'
  amount: DecimalString
  trigger: 'INVOICE' | 'MANUAL'
  created_at: DateTimeString
}

export interface SalesLoyaltyProgram {
  id: UUID
  company: UUID
  name: string
  points_per_currency: DecimalString
  is_active: boolean
}

export interface SalesLoyaltyCard {
  id: UUID
  program: UUID
  program_name: string
  partner: UUID
  partner_name: string
  number: string
  points: DecimalString
  state: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
}

export interface SalesReturn {
  id: UUID
  order: UUID
  order_name: string
  name: string
  state: 'DRAFT' | 'CONFIRMED' | 'DONE'
  reason: string | null
  resolution: 'REFUND' | 'EXCHANGE' | 'CREDIT'
  created_at: DateTimeString
}

export interface SalesForecast {
  id: UUID
  company: UUID
  salesperson: UUID
  salesperson_name: string
  forecast_type: 'REVENUE' | 'UNITS'
  period_from: DateString
  period_to: DateString
  amount: DecimalString
}
