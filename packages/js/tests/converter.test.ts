/**
 * Comprehensive tests for the patro Nepali BS <-> AD date converter.
 *
 * All test-case data is loaded from testdata/cases.json at the monorepo root —
 * a single source of truth shared with the Python test suite.
 * To add new test cases, edit testdata/cases.json only.
 *
 * Test pairs marked [✓] or [✓✓] were cross-verified against external reference implementations.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adToBs, bsToAd, daysInMonth, isValidBs } from '../src/converter.js'
import {
  CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR,
  formatBs, parseBs, compareBs, isBefore, isAfter, isEqual,
} from '../src/index.js'

// ---------------------------------------------------------------------------
// Load shared test cases
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))
const CASES = JSON.parse(
  readFileSync(join(__dirname, '../../../testdata/cases.json'), 'utf-8')
)

// ---------------------------------------------------------------------------
// Conversion pairs — single source of truth
// ---------------------------------------------------------------------------

describe('adToBs — shared pairs', () => {
  for (const { ad: [ay, am, ad], bs: [by, bm, bd], note } of CASES.conversion_pairs) {
    const label = `AD ${ay}-${String(am).padStart(2,'0')}-${String(ad).padStart(2,'0')} = BS ${by}-${String(bm).padStart(2,'0')}-${String(bd).padStart(2,'0')}${note ? ' (' + note + ')' : ''}`
    it(label, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: by, month: bm, day: bd })
    })
  }
})

describe('bsToAd — shared pairs', () => {
  for (const { ad: [ay, am, ad], bs: [by, bm, bd], note } of CASES.conversion_pairs) {
    const label = `BS ${by}-${String(bm).padStart(2,'0')}-${String(bd).padStart(2,'0')} = AD ${ay}-${String(am).padStart(2,'0')}-${String(ad).padStart(2,'0')}${note ? ' (' + note + ')' : ''}`
    it(label, () => {
      expect(bsToAd(by, bm, bd)).toEqual({ year: ay, month: am, day: ad })
    })
  }
})

// ---------------------------------------------------------------------------
// adToBs — out-of-range errors
// ---------------------------------------------------------------------------

describe('adToBs — out-of-range errors', () => {
  for (const { ad: [y, m, d], note } of CASES.ad_to_bs_out_of_range) {
    it(`throws RangeError for AD ${y}-${m}-${d}${note ? ' (' + note + ')' : ''}`, () => {
      expect(() => adToBs(y, m, d)).toThrow(RangeError)
    })
  }
})

// ---------------------------------------------------------------------------
// bsToAd — invalid input errors
// ---------------------------------------------------------------------------

describe('bsToAd — invalid input errors', () => {
  for (const { bs: [y, m, d], reason } of CASES.bs_to_ad_invalid) {
    it(`throws RangeError for BS ${y}-${m}-${d} (${reason})`, () => {
      expect(() => bsToAd(y, m, d)).toThrow(RangeError)
    })
  }
})

// ---------------------------------------------------------------------------
// daysInMonth
// ---------------------------------------------------------------------------

describe('daysInMonth — valid cases', () => {
  for (const { year, month, expected, note } of CASES.days_in_month) {
    it(`BS ${year} month ${month} = ${expected} days${note ? ' [' + note + ']' : ''}`, () => {
      expect(daysInMonth(year, month)).toBe(expected)
    })
  }
})

describe('daysInMonth — out-of-range errors', () => {
  for (const { year, month, reason } of CASES.days_in_month_out_of_range) {
    it(`throws RangeError for year=${year} month=${month} (${reason})`, () => {
      expect(() => daysInMonth(year, month)).toThrow(RangeError)
    })
  }
})

// ---------------------------------------------------------------------------
// isValidBs
// ---------------------------------------------------------------------------

describe('isValidBs — valid dates', () => {
  for (const { bs: [y, m, d], note } of CASES.valid_bs_dates) {
    it(`isValidBs(${y}, ${m}, ${d}) = true${note ? ' — ' + note : ''}`, () => {
      expect(isValidBs(y, m, d)).toBe(true)
    })
  }
})

describe('isValidBs — invalid dates', () => {
  for (const { bs: [y, m, d], reason } of CASES.invalid_bs_dates) {
    it(`isValidBs(${y}, ${m}, ${d}) = false — ${reason}`, () => {
      expect(isValidBs(y, m, d)).toBe(false)
    })
  }
})

// ---------------------------------------------------------------------------
// formatBs / parseBs
// ---------------------------------------------------------------------------

describe('formatBs', () => {
  it('zero-pads month and day', () => {
    expect(formatBs({ year: 2083, month: 5, day: 11 })).toBe('2083-05-11')
  })
  it('handles single-digit month and day', () => {
    expect(formatBs({ year: 1975, month: 1, day: 1 })).toBe('1975-01-01')
  })
  it('round-trips with parseBs', () => {
    const bs = { year: 2083, month: 5, day: 11 }
    expect(parseBs(formatBs(bs))).toEqual(bs)
  })
})

// ---------------------------------------------------------------------------
// compareBs / isBefore / isAfter / isEqual
// ---------------------------------------------------------------------------

describe('compareBs / isBefore / isAfter / isEqual', () => {
  const a = { year: 2083, month: 5, day: 10 }
  const b = { year: 2083, month: 5, day: 11 }
  const c = { year: 2083, month: 5, day: 11 }

  it('compareBs: a < b → -1', () => expect(compareBs(a, b)).toBe(-1))
  it('compareBs: b > a → 1',  () => expect(compareBs(b, a)).toBe(1))
  it('compareBs: equal → 0',  () => expect(compareBs(b, c)).toBe(0))

  it('isBefore: a < b → true',  () => expect(isBefore(a, b)).toBe(true))
  it('isBefore: b < a → false', () => expect(isBefore(b, a)).toBe(false))
  it('isBefore: equal → false', () => expect(isBefore(b, c)).toBe(false))

  it('isAfter: b > a → true',   () => expect(isAfter(b, a)).toBe(true))
  it('isAfter: a > b → false',  () => expect(isAfter(a, b)).toBe(false))
  it('isAfter: equal → false',  () => expect(isAfter(b, c)).toBe(false))

  it('isEqual: same day → true',      () => expect(isEqual(b, c)).toBe(true))
  it('isEqual: different day → false', () => expect(isEqual(a, b)).toBe(false))

  it('usable as sort comparator', () => {
    const dates = [b, a, c]
    expect(dates.sort(compareBs)).toEqual([a, b, c])
  })
})

// ---------------------------------------------------------------------------
// Round-trip tests
// ---------------------------------------------------------------------------

describe('round-trip BS → AD → BS', () => {
  for (const { bs: [y, m, d], note } of CASES.round_trip_bs) {
    it(`round-trips BS ${y}-${m}-${d}${note ? ' (' + note + ')' : ''}`, () => {
      const ad = bsToAd(y, m, d)
      expect(adToBs(ad.year, ad.month, ad.day)).toEqual({ year: y, month: m, day: d })
    })
  }
})

describe('round-trip AD → BS → AD', () => {
  for (const { ad: [y, m, d], note } of CASES.round_trip_ad) {
    it(`round-trips AD ${y}-${m}-${d}${note ? ' (' + note + ')' : ''}`, () => {
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
