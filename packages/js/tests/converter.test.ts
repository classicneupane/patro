/**
 * Comprehensive tests for the patro Nepali BS <-> AD date converter.
 *
 * Conversion pairs are loaded from testdata/pairs.json at the monorepo root —
 * a single source of truth shared with the Python test suite.
 *
 * Test pairs marked [✓] or [✓✓] were cross-verified against external reference implementations.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adToBs, bsToAd, daysInMonth, isValidBs } from '../src/converter.js'
import { CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR } from '../src/index.js'

// ---------------------------------------------------------------------------
// Load shared test pairs
// ---------------------------------------------------------------------------

interface Pair {
  ad: [number, number, number]
  bs: [number, number, number]
  note?: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const pairs: Pair[] = JSON.parse(
  readFileSync(join(__dirname, '../../../testdata/pairs.json'), 'utf-8')
)

// ---------------------------------------------------------------------------
// Conversion pairs (testdata/pairs.json) — single source of truth
// ---------------------------------------------------------------------------

describe('adToBs — shared pairs', () => {
  for (const { ad: [ay, am, ad], bs: [by, bm, bd], note } of pairs) {
    const label = `AD ${ay}-${String(am).padStart(2,'0')}-${String(ad).padStart(2,'0')} = BS ${by}-${String(bm).padStart(2,'0')}-${String(bd).padStart(2,'0')}${note ? ' (' + note + ')' : ''}`
    it(label, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: by, month: bm, day: bd })
    })
  }
})

describe('bsToAd — shared pairs', () => {
  for (const { ad: [ay, am, ad], bs: [by, bm, bd], note } of pairs) {
    const label = `BS ${by}-${String(bm).padStart(2,'0')}-${String(bd).padStart(2,'0')} = AD ${ay}-${String(am).padStart(2,'0')}-${String(ad).padStart(2,'0')}${note ? ' (' + note + ')' : ''}`
    it(label, () => {
      expect(bsToAd(by, bm, bd)).toEqual({ year: ay, month: am, day: ad })
    })
  }
})

// ---------------------------------------------------------------------------
// adToBs — range errors
// ---------------------------------------------------------------------------

describe('adToBs — range errors', () => {

  it('throws RangeError for date before minimum (AD 1918-04-12)', () => {
    expect(() => adToBs(1918, 4, 12)).toThrow(RangeError)
  })

  it('throws RangeError for date well before minimum', () => {
    expect(() => adToBs(1900, 1, 1)).toThrow(RangeError)
  })

  it('throws RangeError for date after maximum', () => {
    expect(() => adToBs(2044, 4, 14)).toThrow(RangeError)
  })

  it('throws RangeError for date well after maximum', () => {
    expect(() => adToBs(2100, 1, 1)).toThrow(RangeError)
  })

  it('year rollover: AD 2005-04-13 = BS 2061-12-31, AD 2005-04-14 = BS 2062-01-01', () => {
    expect(adToBs(2005, 4, 13)).toEqual({ year: 2061, month: 12, day: 31 })
    expect(adToBs(2005, 4, 14)).toEqual({ year: 2062, month:  1, day:  1 })
  })

  it('year rollover: AD 2006-04-13 = BS 2062-12-31, AD 2006-04-14 = BS 2063-01-01', () => {
    expect(adToBs(2006, 4, 13)).toEqual({ year: 2062, month: 12, day: 31 })
    expect(adToBs(2006, 4, 14)).toEqual({ year: 2063, month:  1, day:  1 })
  })

  it('year rollover: AD 2031-04-15 = BS 2087-12-30 (367-day year), AD 2031-04-16 = BS 2088-01-01', () => {
    expect(adToBs(2031, 4, 15)).toEqual({ year: 2087, month: 12, day: 30 })
    expect(adToBs(2031, 4, 16)).toEqual({ year: 2088, month:  1, day:  1 })
  })
})

// ---------------------------------------------------------------------------
// bsToAd — validation errors
// ---------------------------------------------------------------------------

describe('bsToAd — validation errors', () => {

  it('throws RangeError for year < MIN_BS_YEAR', () => {
    expect(() => bsToAd(1974, 1, 1)).toThrow(RangeError)
  })

  it('throws RangeError for year > MAX_BS_YEAR', () => {
    expect(() => bsToAd(2101, 1, 1)).toThrow(RangeError)
  })

  it('throws RangeError for month 0', () => {
    expect(() => bsToAd(2083, 0, 1)).toThrow(RangeError)
  })

  it('throws RangeError for month 13', () => {
    expect(() => bsToAd(2083, 13, 1)).toThrow(RangeError)
  })

  it('throws RangeError for negative month', () => {
    expect(() => bsToAd(2083, -1, 1)).toThrow(RangeError)
  })

  it('throws RangeError for day 0', () => {
    expect(() => bsToAd(2083, 1, 0)).toThrow(RangeError)
  })

  it('throws RangeError for negative day', () => {
    expect(() => bsToAd(2083, 1, -1)).toThrow(RangeError)
  })

  it('throws RangeError for day > max in month (Baisakh 2083 = 31)', () => {
    expect(() => bsToAd(2083, 1, 32)).toThrow(RangeError)
  })

  it('throws RangeError for day 31 in Mangsir 2087 (= 30 days)', () => {
    expect(() => bsToAd(2087, 8, 31)).toThrow(RangeError)
  })

  it('throws RangeError for day 31 in Poush 2087 (= 30 days)', () => {
    expect(() => bsToAd(2087, 9, 31)).toThrow(RangeError)
  })

  it('throws RangeError for day 32 in Baisakh 2062 (= 31 days)', () => {
    expect(() => bsToAd(2062, 1, 32)).toThrow(RangeError)
  })

  it('last valid day of 29-day month (Mangsir 2083) succeeds', () => {
    expect(bsToAd(2083, 8, 29)).toEqual({ year: 2026, month: 12, day: 15 })
  })

  it('day after 29-day month (Mangsir 2083 day 30) throws', () => {
    expect(() => bsToAd(2083, 8, 30)).toThrow(RangeError)
  })

  it('last valid day of 32-day month (Ashadh 2083) succeeds', () => {
    expect(bsToAd(2083, 3, 32)).toEqual({ year: 2026, month: 7, day: 16 })
  })
})

// ---------------------------------------------------------------------------
// daysInMonth
// ---------------------------------------------------------------------------

describe('daysInMonth', () => {

  const bs2083DaysPerMonth: Array<[number, number]> = [
    [1, 31], [2, 31], [3, 32], [4, 31],
    [5, 31], [6, 31], [7, 30], [8, 29],
    [9, 30], [10, 29], [11, 30], [12, 30],
  ]

  for (const [month, expected] of bs2083DaysPerMonth) {
    it(`BS 2083 month ${month} = ${expected} days`, () => {
      expect(daysInMonth(2083, month)).toBe(expected)
    })
  }

  it('[✓] BS 2062 Baisakh = 31 days', () => {
    expect(daysInMonth(2062, 1)).toBe(31)
  })

  it('[✓] BS 2062 Jestha = 31 days', () => {
    expect(daysInMonth(2062, 2)).toBe(31)
  })

  it('[✓✓] BS 2087 Mangsir = 30 days', () => {
    expect(daysInMonth(2087, 8)).toBe(30)
  })

  it('[✓✓] BS 2087 Poush = 30 days', () => {
    expect(daysInMonth(2087, 9)).toBe(30)
  })

  it('BS 1975 month 3 (Ashadh) = 32 days', () => {
    expect(daysInMonth(1975, 3)).toBe(32)
  })

  it('BS 2000 month 1 (Baisakh) = 30 days', () => {
    expect(daysInMonth(2000, 1)).toBe(30)
  })

  it('BS 2100 month 12 (Chaitra) = 30 days (last month of last year)', () => {
    expect(daysInMonth(2100, 12)).toBe(30)
  })

  it('throws RangeError for year out of range', () => {
    expect(() => daysInMonth(1974, 1)).toThrow(RangeError)
    expect(() => daysInMonth(2101, 1)).toThrow(RangeError)
  })

  it('throws RangeError for month out of range', () => {
    expect(() => daysInMonth(2083, 0)).toThrow(RangeError)
    expect(() => daysInMonth(2083, 13)).toThrow(RangeError)
  })
})

// ---------------------------------------------------------------------------
// isValidBs
// ---------------------------------------------------------------------------

describe('isValidBs', () => {

  const validDates: Array<[number, number, number]> = [
    [1975,  1,  1],   // min
    [2083,  5, 11],   // today
    [2100, 12, 30],   // max
    [2062,  1, 31],   // Baisakh 2062 last day (31, NOT 30)
    [2062,  2, 31],   // Jestha 2062 last day (31, NOT 32)
    [2087,  8, 30],   // Mangsir 2087 last day (30, NOT 29)
    [2087,  9, 30],   // Poush 2087 last day (30, NOT 29)
    [2083,  3, 32],   // 32-day month last day
    [2083,  8, 29],   // 29-day month last day
  ]

  for (const [y, m, d] of validDates) {
    it(`isValidBs(${y}, ${m}, ${d}) = true`, () => {
      expect(isValidBs(y, m, d)).toBe(true)
    })
  }

  const invalidDates: Array<[number, number, number]> = [
    [1974,  1,  1],   // year too low
    [2101,  1,  1],   // year too high
    [2083,  0,  1],   // month 0
    [2083, 13,  1],   // month 13
    [2083,  1,  0],   // day 0
    [2083,  1, 32],   // day > max (Baisakh 2083 = 31)
    [2062,  1, 32],   // day > max (Baisakh 2062 = 31)
    [2087,  8, 31],   // day > max (Mangsir 2087 = 30)
    [2087,  9, 31],   // day > max (Poush 2087 = 30)
    [2083,  3, 33],   // day > max (Ashadh 2083 = 32)
  ]

  for (const [y, m, d] of invalidDates) {
    it(`isValidBs(${y}, ${m}, ${d}) = false`, () => {
      expect(isValidBs(y, m, d)).toBe(false)
    })
  }
})

// ---------------------------------------------------------------------------
// Round-trip tests
// ---------------------------------------------------------------------------

describe('round-trip', () => {

  const bsDates: Array<[number, number, number]> = [
    [1975,  1,  1],   // min
    [1975, 12, 30],   // end of first year
    [2000,  1,  1],
    [2000,  6, 15],
    [2062,  1,  1],
    [2062,  1, 31],   // Baisakh 2062 last (corrected)
    [2062,  2, 31],   // Jestha 2062 last (corrected)
    [2083,  3, 32],   // 32-day month
    [2083,  5, 11],   // today
    [2083,  8, 29],   // 29-day month last day
    [2087,  1,  1],   // first day of corrected year
    [2087,  8, 30],   // Mangsir last (corrected)
    [2087,  9, 30],   // Poush last (corrected)
    [2087, 12, 30],   // last day of BS 2087
    [2100, 12, 30],   // max
  ]

  for (const [y, m, d] of bsDates) {
    it(`bsToAd → adToBs round-trips BS ${y}-${m}-${d}`, () => {
      const ad = bsToAd(y, m, d)
      expect(adToBs(ad.year, ad.month, ad.day)).toEqual({ year: y, month: m, day: d })
    })
  }

  const adDates: Array<[number, number, number]> = [
    [1918,  4, 13],   // reference anchor
    [1940,  1,  1],
    [1960,  6, 15],
    [2000,  1,  1],
    [2005,  5, 14],   // BS 2062 Baisakh last
    [2005,  6, 14],   // BS 2062 Jestha last
    [2026,  8, 27],   // today
    [2030, 12, 16],   // BS 2087 Mangsir last
    [2031,  1, 15],   // BS 2087 Poush last
    [2031,  4, 16],   // BS 2088 start
    [2044,  4, 13],   // max AD date
  ]

  for (const [y, m, d] of adDates) {
    it(`adToBs → bsToAd round-trips AD ${y}-${m}-${d}`, () => {
      const bs = adToBs(y, m, d)
      expect(bsToAd(bs.year, bs.month, bs.day)).toEqual({ year: y, month: m, day: d })
    })
  }
})

// ---------------------------------------------------------------------------
// Calendar data integrity
// ---------------------------------------------------------------------------

describe('calendar data integrity', () => {

  it('all years present with no gaps', () => {
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      expect(CALENDAR[y]).toBeDefined()
    }
  })

  it('all years have exactly 12 months', () => {
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      expect(CALENDAR[y]).toHaveLength(12)
    }
  })

  it('all month values are in valid range (29–32)', () => {
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      const months = CALENDAR[y]!
      for (let mi = 0; mi < 12; mi++) {
        const days = months[mi]!
        expect(days).toBeGreaterThanOrEqual(29)
        expect(days).toBeLessThanOrEqual(32)
      }
    }
  })

  it('all year totals are 364–367 days (BS 2096 = 364 is a known data point)', () => {
    const known: Record<number, number> = { 2096: 364 }
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      const total = CALENDAR[y]!.reduce((a, b) => a + b, 0)
      const expected = known[y] ?? null
      if (expected !== null) {
        expect(total).toBe(expected)
      } else {
        expect(total).toBeGreaterThanOrEqual(365)
        expect(total).toBeLessThanOrEqual(367)
      }
    }
  })

  it('[✓✓] BS 2087 = 367 days total', () => {
    expect(CALENDAR[2087]!.reduce((a, b) => a + b, 0)).toBe(367)
  })

  it('[✓✓] BS 2087 month 8 (Mangsir) = 30 days', () => {
    expect(CALENDAR[2087]![7]).toBe(30)
  })

  it('[✓✓] BS 2087 month 9 (Poush) = 30 days', () => {
    expect(CALENDAR[2087]![8]).toBe(30)
  })

  it('[✓] BS 2062 month 1 (Baisakh) = 31 days', () => {
    expect(CALENDAR[2062]![0]).toBe(31)
  })

  it('[✓] BS 2062 month 2 (Jestha) = 31 days', () => {
    expect(CALENDAR[2062]![1]).toBe(31)
  })

  it('MIN_BS_YEAR = 1975', () => {
    expect(MIN_BS_YEAR).toBe(1975)
  })

  it('MAX_BS_YEAR = 2100', () => {
    expect(MAX_BS_YEAR).toBe(2100)
  })
})
