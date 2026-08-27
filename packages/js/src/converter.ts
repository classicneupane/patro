import { CALENDAR } from './calendar.js'
import { MIN_BS_YEAR, MAX_BS_YEAR } from './constants.js'
import type { BsDate, AdDate } from './types.js'

// Reference anchor: AD 1918-04-13 = BS 1975-01-01
function epochDays(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
}

const REFERENCE_EPOCH_DAYS = epochDays(1918, 4, 13)

// Pre-compute cumulative days from BS 1975-01-01 to the start of each BS year
// yearStartDays[i] = [year, cumulativeDays]
const yearStartDays: Array<[number, number]> = []
let _acc = 0
for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
  yearStartDays.push([y, _acc])
  const months = CALENDAR[y]
  if (months === undefined) throw new Error(`Missing calendar data for BS year ${y}`)
  _acc += months.reduce((a, b) => a + b, 0)
}
const TOTAL_BS_DAYS = _acc

// Max supported AD date epoch days (BS 2100-12-30 → need to compute from bsToAd)
// We compute this lazily; the max delta is TOTAL_BS_DAYS - 1
const MAX_DELTA = TOTAL_BS_DAYS - 1

export function daysInMonth(year: number, month: number): number {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new RangeError(`BS year ${year} is out of supported range [${MIN_BS_YEAR}, ${MAX_BS_YEAR}]`)
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`Month ${month} is out of range [1, 12]`)
  }
  const months = CALENDAR[year]
  if (months === undefined) throw new Error(`Missing calendar data for BS year ${year}`)
  const days = months[month - 1]
  if (days === undefined) throw new Error(`Missing calendar data for BS year ${year} month ${month}`)
  return days
}

export function isValidBs(year: number, month: number, day: number): boolean {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > daysInMonth(year, month)) return false
  return true
}

export function adToBs(year: number, month: number, day: number): BsDate {
  const inputEpoch = epochDays(year, month, day)
  const delta = inputEpoch - REFERENCE_EPOCH_DAYS

  if (delta < 0) {
    throw new RangeError(
      `AD date ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} is before the minimum supported date (AD 1918-04-13 = BS 1975-01-01)`
    )
  }
  if (delta > MAX_DELTA) {
    throw new RangeError(
      `AD date ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} is after the maximum supported date (BS 2100-12-30)`
    )
  }

  // Binary search for the BS year
  let lo = 0
  let hi = yearStartDays.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const entry = yearStartDays[mid]
    if (entry === undefined) break
    if (entry[1] <= delta) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  const yearEntry = yearStartDays[lo]
  if (yearEntry === undefined) throw new Error('Internal error: yearStartDays lookup failed')
  const bsYear = yearEntry[0]
  let remaining = delta - yearEntry[1]

  const months = CALENDAR[bsYear]
  if (months === undefined) throw new Error(`Missing calendar data for BS year ${bsYear}`)

  let bsMonth = 1
  for (let m = 0; m < 12; m++) {
    const daysInM = months[m]
    if (daysInM === undefined) throw new Error(`Missing calendar data for BS year ${bsYear} month ${m + 1}`)
    if (remaining < daysInM) {
      bsMonth = m + 1
      break
    }
    remaining -= daysInM
  }

  return { year: bsYear, month: bsMonth, day: remaining + 1 }
}

export function bsToAd(year: number, month: number, day: number): AdDate {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new RangeError(`BS year ${year} is out of supported range [${MIN_BS_YEAR}, ${MAX_BS_YEAR}]`)
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`Month ${month} is out of range [1, 12]`)
  }
  const maxDay = daysInMonth(year, month)
  if (day < 1 || day > maxDay) {
    throw new RangeError(`Day ${day} is out of range [1, ${maxDay}] for BS ${year}/${month}`)
  }

  // Count days from BS 1975-01-01 to the given BS date
  let totalDays = 0

  // Sum all complete years before this one
  for (let y = MIN_BS_YEAR; y < year; y++) {
    const months = CALENDAR[y]
    if (months === undefined) throw new Error(`Missing calendar data for BS year ${y}`)
    totalDays += months.reduce((a, b) => a + b, 0)
  }

  // Sum complete months in the current year
  const yearMonths = CALENDAR[year]
  if (yearMonths === undefined) throw new Error(`Missing calendar data for BS year ${year}`)
  for (let m = 0; m < month - 1; m++) {
    const d = yearMonths[m]
    if (d === undefined) throw new Error(`Missing calendar data for BS year ${year} month ${m + 1}`)
    totalDays += d
  }

  // Add days in the current month (0-indexed: day 1 = 0 extra days)
  totalDays += day - 1

  // Add to reference epoch
  const adEpoch = REFERENCE_EPOCH_DAYS + totalDays
  const adDate = new Date(adEpoch * 86400000)

  return {
    year: adDate.getUTCFullYear(),
    month: adDate.getUTCMonth() + 1,
    day: adDate.getUTCDate(),
  }
}
