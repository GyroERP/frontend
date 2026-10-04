import type { UUID, DateTimeString, DecimalString } from '@/api/types/common'

// ── Enums (lowercase = what the backend actually stores) ──────────────────────

export type ProductType = 'storable' | 'consumable' | 'service'
export type TrackingType = 'none' | 'lot' | 'serial'
export type PickingState = 'draft' | 'confirmed' | 'assigned' | 'done' | 'cancelled'
export type PickingTypeCode = 'incoming' | 'outgoing' | 'internal' | 'mrpop' | 'other'
export type MoveState = 'draft' | 'confirmed' | 'partially_available' | 'assigned' | 'done' | 'cancelled'
export type LocationType = 'internal' | 'supplier' | 'customer' | 'transit' | 'inventory_loss' | 'production' | 'scrap' | 'virtual'
export type BarcodeType = 'ean13' | 'ean8' | 'upc_a' | 'upc_e' | 'qr' | 'code128' | 'datamatrix' | 'internal'
export type DisplayType = 'radio' | 'select' | 'color' | 'pills'
export type CreateVariantMode = 'always' | 'dynamic' | 'never'
export type CostMethod = 'standard' | 'average' | 'fifo'
export type UomType = 'reference' | 'bigger' | 'smaller'

// ── UoM ───────────────────────────────────────────────────────────────────────

export interface UomCategory {
  id: UUID
  name: string
  measure_type: string
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface Uom {
  id: UUID
  name: string
  symbol: string
  category: UUID
  category_name: string
  uom_type: UomType
  ratio: DecimalString
  rounding: DecimalString
  is_integer: boolean
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

// ── Product Attributes ────────────────────────────────────────────────────────

export interface ProductAttributeValue {
  id: UUID
  attribute: UUID
  name: string
  color_code: string
  sequence: number
  is_custom: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductAttribute {
  id: UUID
  name: string
  display_type: DisplayType
  create_variant: CreateVariantMode
  sequence: number
  is_active: boolean
  values: ProductAttributeValue[]
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductTemplateAttributeLine {
  id: UUID
  template: UUID
  attribute: UUID
  attribute_name: string
  values: ProductAttributeValue[]
  value_ids: UUID[]
  sequence: number
}

export interface ProductVariantAttributeValue {
  id: UUID
  variant: UUID
  attribute_line: UUID
  attribute_name: string
  attribute_value: UUID
  value_name: string
}

// ── Product Catalog ───────────────────────────────────────────────────────────

export interface ProductCategory {
  id: UUID
  name: string
  full_name: string
  parent: UUID | null
  removal_strategy: string
  cost_method: CostMethod
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductTemplate {
  id: UUID
  name: string
  internal_ref: string | null
  description: string | null
  description_purchase: string | null
  description_sale: string | null
  description_picking: string | null
  product_type: ProductType
  category: UUID | null
  category_name: string | null
  company: UUID | null
  uom: UUID
  uom_name: string
  uom_purchase: UUID
  uom_purchase_name: string
  sales_price: DecimalString
  currency: UUID | null
  standard_price: DecimalString
  can_be_sold: boolean
  can_be_purchased: boolean
  can_be_expensed: boolean
  can_be_rented: boolean
  can_be_subscribed: boolean
  weight: DecimalString | null
  volume: DecimalString | null
  hs_code: string | null
  carbon_footprint_g: DecimalString | null
  tracking: TrackingType
  use_expiry_date: boolean
  expiry_time: number | null
  use_best_before: boolean
  best_before_time: number | null
  is_active: boolean
  variant_count: number
  has_variants: boolean
  main_image_url: string | null
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductVariant {
  id: UUID
  template: UUID
  combination_name: string
  barcode: string | null
  internal_ref: string | null
  sales_price_extra: DecimalString
  standard_price: DecimalString | null
  weight_override: DecimalString | null
  volume_override: DecimalString | null
  effective_sales_price: DecimalString
  effective_standard_price: DecimalString | null
  is_active: boolean
  attribute_values: ProductVariantAttributeValue[]
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductBarcode {
  id: UUID
  template: UUID | null
  variant: UUID | null
  barcode: string
  barcode_type: BarcodeType
  barcode_type_display: string
  uom: UUID | null
  qty: DecimalString
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductImage {
  id: UUID
  template: UUID | null
  variant: UUID | null
  url: string
  file: UUID | null
  alt_text: string
  is_main: boolean
  sequence: number
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductPackaging {
  id: UUID
  template: UUID
  variant: UUID | null
  name: string
  qty: DecimalString
  barcode: string | null
  max_weight: DecimalString | null
  company: UUID | null
  sequence: number
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface ProductSupplierInfo {
  id: UUID
  template: UUID
  variant: UUID | null
  partner: UUID
  partner_name: string
  company: UUID | null
  vendor_code: string | null
  currency: UUID | null
  min_qty: DecimalString
  price: DecimalString
  price_uom: UUID | null
  date_start: string | null
  date_end: string | null
  delay: number
  on_time_rate: DecimalString | null
  quality_rate: DecimalString | null
  avg_delay_days: DecimalString | null
  is_valid_today: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

// ── Warehouse & Stock ─────────────────────────────────────────────────────────

export interface Warehouse {
  id: UUID
  name: string
  code: string
  company: UUID
  address: UUID | null
  reception_steps: 'one_step' | 'two_step' | 'three_step'
  delivery_steps: 'one_step' | 'two_step' | 'three_step'
  lot_stock_id: UUID | null
  wh_input_id: UUID | null
  wh_qc_id: UUID | null
  wh_output_id: UUID | null
  wh_pack_id: UUID | null
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface StockLocation {
  id: UUID
  name: string
  full_name: string
  parent: UUID | null
  location_type: LocationType
  company: UUID | null
  barcode: string | null
  path: string
  removal_strategy: string | null
  storage_category: UUID | null
  cyclic_inventory_days: number | null
  is_replenish: boolean
  scrap_location: boolean
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface OperationType {
  id: UUID
  name: string
  code: PickingTypeCode
  warehouse: UUID | null
  company: UUID
  default_location_src: UUID | null
  default_location_dest: UUID | null
  is_active: boolean
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface StockLot {
  id: UUID
  name: string
  product: UUID
  company: UUID
  ref: string | null
  product_date: DateTimeString | null
  expiry_date: DateTimeString | null
  best_before_date: DateTimeString | null
  removal_date: DateTimeString | null
  alert_date: DateTimeString | null
  supplier_lot_ref: string | null
  received_date: string | null
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface StockQuant {
  id: number
  product: UUID
  location: UUID
  lot: UUID | null
  package: UUID | null
  owner: UUID | null
  company: UUID
  quantity: DecimalString
  reserved_quantity: DecimalString
  available_quantity: DecimalString
}

export interface StockMoveLine {
  id: UUID
  move: UUID
  product: UUID
  product_uom: UUID
  lot: UUID | null
  location_src: UUID
  location_dest: UUID
  reserved_qty: DecimalString
  qty_done: DecimalString
  is_done: boolean
}

export interface StockMove {
  id: UUID
  picking: UUID | null
  product: UUID
  product_uom: UUID
  company: UUID
  location_src: UUID
  location_dest: UUID
  product_qty: DecimalString
  quantity_done: DecimalString
  reserved_qty: DecimalString
  state: MoveState
  origin: string | null
  date: DateTimeString | null
  move_lines: StockMoveLine[]
  created_at: DateTimeString
  updated_at: DateTimeString
}

export interface StockPicking {
  id: UUID
  name: string
  picking_type: UUID
  partner: UUID | null
  company: UUID
  state: PickingState
  location_src: UUID
  location_dest: UUID
  scheduled_date: DateTimeString | null
  date_done: DateTimeString | null
  origin: string | null
  note: string | null
  backorder_of: UUID | null
  moves: StockMove[]
  created_at: DateTimeString
  updated_at: DateTimeString
}
