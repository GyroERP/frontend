/** Minimal sales order line shape for shared document tables (erp layer). */
export interface SalesOrderLineRow {
  id: string
  variant_name: string
  description?: string | null
  product_qty: string | number
  price_unit: string
  price_subtotal: string
}

/** Minimal purchase order line shape for shared document tables (erp layer). */
export interface PurchaseOrderLineRow {
  id: string
  variant_name: string
  name?: string | null
  supplier_code?: string | null
  product_qty: string | number
  product_uom_name?: string
  price_unit: string
  qty_received: string | number
  qty_invoiced: string | number
  price_subtotal: string
}
