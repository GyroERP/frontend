import {
  format,
  parseISO,
  isValid,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  isAfter,
  isBefore,
} from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const DATE_FORMAT = 'MMM d, yyyy'
export const DATE_TIME_FORMAT = 'MMM d, yyyy HH:mm'
export const DATE_INPUT_FORMAT = 'yyyy-MM-dd'
export const TIME_FORMAT = 'HH:mm'

/** Parse an ISO UTC string and convert to the given timezone for display. */
export function parseToZoned(isoString: string, timezone = 'UTC'): Date {
  return toZonedTime(parseISO(isoString), timezone)
}

/** Format a UTC ISO string for display in the given timezone. */
export function formatDate(
  isoString: string | null | undefined,
  timezone = 'UTC',
  fmt = DATE_FORMAT,
): string {
  if (!isoString) return '—'
  const zoned = toZonedTime(parseISO(isoString), timezone)
  if (!isValid(zoned)) return '—'
  return format(zoned, fmt)
}

export function formatDateTime(
  isoString: string | null | undefined,
  timezone = 'UTC',
): string {
  return formatDate(isoString, timezone, DATE_TIME_FORMAT)
}

/** "2 hours ago" style relative time. Always computed from UTC. */
export function formatRelative(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = parseISO(isoString)
  if (!isValid(date)) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

/** Convert a local Date in the given timezone to a UTC ISO string for the API. */
export function toUtcIso(localDate: Date, timezone = 'UTC'): string {
  return fromZonedTime(localDate, timezone).toISOString()
}

/** Common date range presets for report filters. */
export function getDatePresets(timezone = 'UTC') {
  const now = toZonedTime(new Date(), timezone)
  return {
    today: { from: startOfDay(now), to: endOfDay(now) },
    yesterday: { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) },
    last7Days: { from: startOfDay(subDays(now, 6)), to: endOfDay(now) },
    last30Days: { from: startOfDay(subDays(now, 29)), to: endOfDay(now) },
    thisMonth: { from: startOfMonth(now), to: endOfMonth(now) },
    lastMonth: {
      from: startOfMonth(subMonths(now, 1)),
      to: endOfMonth(subMonths(now, 1)),
    },
  }
}

export { isAfter, isBefore, startOfDay, endOfDay, startOfMonth, endOfMonth, format, parseISO, isValid }
