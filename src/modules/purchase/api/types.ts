import type { UUID, DateTimeString, DateString, DecimalString } from '@/api/types/common'

export type PurchaseOrderState =
  | 'DRAFT' | 'SENT' | 'CONFIRMATION' | 'APPROVED'
  | 'TO_RECEIVE' | 'RECEIVED' | 'DONE' | 'CANCELLED'

export type RequisitionState = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface PurchaseOrder {
  id: UUID
  company: UUID
  name: string
  partner: UUID
  partner_name: string
  state: PurchaseOrderState
  currency: UUID
  currency_code: string
  payment_term: UUID | null
  payment_term_name: string | null
  date_order: DateTimeString
  date_approve: DateTimeString | null
  date_planned: DateTimeString | null
  amount_untaxed: DecimalString
  amount_tax: DecimalString
  amount_total: DecimalString
  line_count: number
  created_at: DateTimeString
}

export interface PurchaseOrderLine {
  id: UUID
  order: UUID
  variant: UUID
  variant_name: string
  name: string
  product_qty: DecimalString
  product_uom: UUID
  product_uom_name: string
  price_unit: DecimalString
  price_subtotal: DecimalString
  qty_received: DecimalString
  qty_invoiced: DecimalString
  date_planned: DateTimeString | null
  supplier_code: string | null
}

export interface PurchaseRequisition {
  id: UUID
  company: UUID
  name: string
  state: RequisitionState
  assigned_to: UUID | null
  assigned_to_name: string | null
  reason: string | null
  created_at: DateTimeString
}

export interface PurchaseAgreement {
  id: UUID
  company: UUID
  supplier: UUID
  supplier_name: string
  name: string
  state: 'DRAFT' | 'ACTIVE' | 'EXPIRED'
  date_from: DateString
  date_to: DateString
}

export interface PurchaseRFQCampaign {
  id: UUID
  company: UUID
  name: string
  state: 'DRAFT' | 'IN_PROGRESS' | 'DONE'
  date_start: DateString
  date_end: DateString
  vendor_response_count: number
}

export interface PurchaseSupplierEvaluation {
  id: UUID
  company: UUID
  supplier: UUID
  supplier_name: string
  criteria: 'QUALITY' | 'PRICE' | 'DELIVERY'
  score: DecimalString    // 1-5
  notes: string | null
  created_at: DateTimeString
}
