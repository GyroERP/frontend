import type { ListParams } from '@/api/types/common'

export const inventoryKeys = {
  all:            () => ['inventory'] as const,
  // Products
  products:       () => [...inventoryKeys.all(), 'products'] as const,
  productList:    (p?: ListParams) => [...inventoryKeys.products(), 'list', p] as const,
  product:        (id: string) => [...inventoryKeys.products(), id] as const,
  variants:       (templateId: string) => [...inventoryKeys.product(templateId), 'variants'] as const,
  variant:        (id: string) => [...inventoryKeys.all(), 'variants', id] as const,
  attributeLines: (templateId: string) => [...inventoryKeys.product(templateId), 'attribute-lines'] as const,
  images:         (templateId: string) => [...inventoryKeys.product(templateId), 'images'] as const,
  packaging:      (templateId: string) => [...inventoryKeys.product(templateId), 'packaging'] as const,
  suppliers:      (templateId: string) => [...inventoryKeys.product(templateId), 'suppliers'] as const,
  barcodes:       (templateId: string) => [...inventoryKeys.product(templateId), 'barcodes'] as const,
  // Attributes
  attributes:     (p?: ListParams) => [...inventoryKeys.all(), 'attributes', p] as const,
  attribute:      (id: string) => [...inventoryKeys.all(), 'attribute', id] as const,
  attrValues:     (attributeId: string) => [...inventoryKeys.all(), 'attr-values', attributeId] as const,
  // Reference data
  categories:     () => [...inventoryKeys.all(), 'categories'] as const,
  uoms:           (p?: ListParams) => [...inventoryKeys.all(), 'uoms', p] as const,
  warehouses:     (p?: ListParams) => [...inventoryKeys.all(), 'warehouses', p] as const,
  locations:      (p?: ListParams) => [...inventoryKeys.all(), 'locations', p] as const,
  operationTypes: (p?: ListParams) => [...inventoryKeys.all(), 'operation-types', p] as const,
  // Stock
  quants:         (p?: ListParams) => [...inventoryKeys.all(), 'quants', p] as const,
  lots:           (p?: ListParams) => [...inventoryKeys.all(), 'lots', p] as const,
  lot:            (id: string) => [...inventoryKeys.all(), 'lots', id] as const,
  // Transfers
  pickings:       () => [...inventoryKeys.all(), 'pickings'] as const,
  pickingList:    (p?: ListParams) => [...inventoryKeys.pickings(), 'list', p] as const,
  picking:        (id: string) => [...inventoryKeys.pickings(), id] as const,
}
