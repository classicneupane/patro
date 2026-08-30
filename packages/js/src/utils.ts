import { adToBs, bsToAd, daysInMonth } from './converter.js'
import { CALENDAR } from './calendar.js'
import { MIN_BS_YEAR, MAX_BS_YEAR } from './constants.js'
import type { BsDate, AdDate } from './types.js'

const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const

/** Convert ASCII digits in a string/number to Nepali script digits */
export function toNepaliDigits(n: number | string): string {
  return String(n).replace(/\d/g, d => NP_DIGITS[Number(d)] ?? d)
}

/** Return today's date in BS */
export function todayBs(): BsDate {
  const now = new Date()
  return adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** Return the next BS month, rolling over to the next year at month 12 */
export function nextBsMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

/** Return the previous BS month, rolling back to the previous year at month 1 */
export function prevBsMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

/**
 * Parse a BS date string in `YYYY-MM-DD` format.
 * Throws `RangeError` if the string is malformed or the date is out of range.
 */
export function parseBs(dateStr: string): BsDate {
  const parts = dateStr.trim().split('-')
  if (parts.length !== 3) {
    throw new RangeError(`BS date must be in YYYY-MM-DD format, got: "${dateStr}"`)
  }
  const nums = parts.map(Number)
  const y = nums[0]!, m = nums[1]!, d = nums[2]!
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)
      || parts.some(p => p.trim() === '')) {
    throw new RangeError(`BS date must be in YYYY-MM-DD format, got: "${dateStr}"`)
  }
  if (y < MIN_BS_YEAR || y > MAX_BS_YEAR) {
    throw new RangeError(`BS year ${y} is out of supported range [${MIN_BS_YEAR}, ${MAX_BS_YEAR}]`)
  }
  if (m < 1 || m > 12) {
    throw new RangeError(`Month ${m} is out of range [1, 12]`)
  }
  const maxDay = daysInMonth(y, m)
  if (d < 1 || d > maxDay) {
    throw new RangeError(`Day ${d} is out of range [1, ${maxDay}] for BS ${y}/${m}`)
  }
  return { year: y, month: m, day: d }
}

/**
 * Format a BS date as a `YYYY-MM-DD` string (zero-padded).
 * This is the canonical string representation used in database fields.
 */
export function formatBs(date: BsDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

/**
 * Return the day of week for a BS date.
 * 0 = Sunday, 1 = Monday, …, 6 = Saturday
 */
export function dayOfWeekBs(year: number, month: number, day: number): number {
  const ad = bsToAd(year, month, day)
  return new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay()
}

/** Return the total number of days in a BS year */
export function daysInYear(year: number): number {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new RangeError(`BS year ${year} is out of supported range [${MIN_BS_YEAR}, ${MAX_BS_YEAR}]`)
  }
  return CALENDAR[year]!.reduce((a: number, b: number) => a + b, 0)
}

/**
 * Parse an AD date string in `YYYY-MM-DD` format.
 * Throws `RangeError` if the string is malformed.
 */
export function parseAd(dateStr: string): AdDate {
  const parts = dateStr.trim().split('-')
  if (parts.length !== 3) {
    throw new RangeError(`AD date must be in YYYY-MM-DD format, got: "${dateStr}"`)
  }
  const nums = parts.map(Number)
  const y = nums[0]!, m = nums[1]!, d = nums[2]!
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)
      || parts.some(p => p.trim() === '')) {
    throw new RangeError(`AD date must be in YYYY-MM-DD format, got: "${dateStr}"`)
  }
  if (m < 1 || m > 12) throw new RangeError(`Month ${m} is out of range [1, 12]`)
  const maxDay = new Date(y, m, 0).getDate()
  if (d < 1 || d > maxDay) throw new RangeError(`Day ${d} is out of range [1, ${maxDay}] for ${y}/${m}`)
  return { year: y, month: m, day: d }
}

/**
 * Compare two BS dates. Returns -1 if a < b, 0 if equal, 1 if a > b.
 * Useful as a sort comparator: `dates.sort(compareBs)`.
 */
export function compareBs(a: BsDate, b: BsDate): -1 | 0 | 1 {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1
  if (a.month !== b.month) return a.month < b.month ? -1 : 1
  if (a.day !== b.day) return a.day < b.day ? -1 : 1
  return 0
}

/** Return true if BS date `a` is before `b`. */
export function isBefore(a: BsDate, b: BsDate): boolean {
  return compareBs(a, b) === -1
}

/** Return true if BS date `a` is after `b`. */
export function isAfter(a: BsDate, b: BsDate): boolean {
  return compareBs(a, b) === 1
}

/** Return true if two BS dates represent the same day. */
export function isEqual(a: BsDate, b: BsDate): boolean {
  return compareBs(a, b) === 0
}
