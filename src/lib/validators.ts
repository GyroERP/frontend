import { z } from 'zod'

/** UUID v4 validator (matches Django's UUIDField output). */
export const uuid = z.string().uuid()

/** Decimal string validator — matches Django DecimalField serialized output. */
export const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, 'Must be a valid decimal number')

/** Non-empty string (trimmed). */
export const requiredString = z.string().trim().min(1, 'This field is required')

/** Optional string (null or empty → null). */
export const optionalString = z.string().trim().optional().nullable()

/** Positive decimal amount (for prices, quantities). */
export const positiveDecimal = decimalString.refine(
  (val) => parseFloat(val) >= 0,
  'Must be a positive number',
)

/** Email validator. */
export const email = z.string().email('Enter a valid email address')

/** Date string (ISO 8601 date only, e.g. 2025-01-15). */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

/** DateTime string (ISO 8601). */
export const dateTimeString = z.string().datetime({ offset: true })

/** Phone number — basic validation. */
export const phoneNumber = z
  .string()
  .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Enter a valid phone number')
  .optional()
  .nullable()

/** File size validator (bytes). */
export const maxFileSize = (maxMb: number) =>
  z
    .instanceof(File)
    .refine((f) => f.size <= maxMb * 1024 * 1024, `File must be ≤ ${maxMb} MB`)
