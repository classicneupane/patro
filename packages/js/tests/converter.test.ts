/**
 * Comprehensive tests for the patro Nepali BS <-> AD date converter.
 *
 * All AD<->BS pairs marked with [H] are verified against Hamropatro (gold standard).
 * All pairs marked with [A] are verified against prabinghimire1 API.
 * Unmarked pairs are derived from the verified reference anchor via the algorithm.
 */

import { describe, it, expect } from 'vitest'
import { adToBs, bsToAd, daysInMonth, isValidBs } from '../src/converter.js'
import { CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR } from '../src/index.js'

// ---------------------------------------------------------------------------
// adToBs
// ---------------------------------------------------------------------------

describe('adToBs', () => {

  // ── Reference & known spot checks ─────────────────────────────────────────

  it('[H] reference anchor: AD 1918-04-13 = BS 1975-01-01', () => {
    expect(adToBs(1918, 4, 13)).toEqual({ year: 1975, month: 1, day: 1 })
  })

  it('[H] today: AD 2026-08-27 = BS 2083-05-11', () => {
    expect(adToBs(2026, 8, 27)).toEqual({ year: 2083, month: 5, day: 11 })
  })

  // ── Year boundaries — spread across full range ────────────────────────────

  const yearBoundaries: Array<[number, number, number, number, number, number]> = [
    [1918,  4, 13, 1975,  1,  1],   // first day of BS 1975
    [1919,  4, 12, 1975, 12, 30],   // last  day of BS 1975
    [1923,  4, 13, 1980,  1,  1],
    [1924,  4, 12, 1980, 12, 31],
    [1933,  4, 13, 1990,  1,  1],
    [1934,  4, 12, 1990, 12, 30],
    [1943,  4, 14, 2000,  1,  1],
    [1944,  4, 12, 2000, 12, 31],
    [1953,  4, 13, 2010,  1,  1],
    [1954,  4, 12, 2010, 12, 30],
    [1963,  4, 14, 2020,  1,  1],
    [1964,  4, 12, 2020, 12, 30],
    [1973,  4, 13, 2030,  1,  1],
    [1974,  4, 13, 2030, 12, 31],
    [1983,  4, 14, 2040,  1,  1],
    [1984,  4, 12, 2040, 12, 30],
    [1993,  4, 13, 2050,  1,  1],
    [1994,  4, 13, 2050, 12, 31],
    [2003,  4, 14, 2060,  1,  1],
    [2004,  4, 12, 2060, 12, 30],
    [2013,  4, 14, 2070,  1,  1],
    [2014,  4, 13, 2070, 12, 30],
    [2023,  4, 14, 2080,  1,  1],
    [2024,  4, 12, 2080, 12, 30],
    [2026,  4, 14, 2083,  1,  1],
    [2027,  4, 13, 2083, 12, 30],
    [2033,  4, 15, 2090,  1,  1],
    [2034,  4, 14, 2090, 12, 30],
    [2043,  4, 15, 2100,  1,  1],
    [2044,  4, 13, 2100, 12, 30],  // last supported date
  ]

  for (const [ay, am, ad, by, bm, bd] of yearBoundaries) {
    it(`AD ${ay}-${am}-${ad} = BS ${by}-${bm}-${bd}`, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: by, month: bm, day: bd })
    })
  }

  // ── BS 2083 — all 12 months (current year, Hamropatro verified) [H] ───────

  const bs2083Months: Array<[number, number, number, number, number]> = [
    [2026,  4, 14,  1,  1],   // Baisakh 1
    [2026,  5, 14,  1, 31],   // Baisakh 31 (last)
    [2026,  5, 15,  2,  1],   // Jestha 1
    [2026,  6, 14,  2, 31],   // Jestha 31 (last)
    [2026,  6, 15,  3,  1],   // Ashadh 1
    [2026,  7, 16,  3, 32],   // Ashadh 32 (last — 32-day month)
    [2026,  7, 17,  4,  1],   // Shrawan 1
    [2026,  8, 16,  4, 31],   // Shrawan 31 (last)
    [2026,  8, 17,  5,  1],   // Bhadra 1
    [2026,  9, 16,  5, 31],   // Bhadra 31 (last)
    [2026,  9, 17,  6,  1],   // Ashwin 1
    [2026, 10, 17,  6, 31],   // Ashwin 31 (last)
    [2026, 10, 18,  7,  1],   // Kartik 1
    [2026, 11, 16,  7, 30],   // Kartik 30 (last)
    [2026, 11, 17,  8,  1],   // Mangsir 1
    [2026, 12, 15,  8, 29],   // Mangsir 29 (last — 29-day month)
    [2026, 12, 16,  9,  1],   // Poush 1
    [2027,  1, 14,  9, 30],   // Poush 30 (last)
    [2027,  1, 15, 10,  1],   // Magh 1
    [2027,  2, 12, 10, 29],   // Magh 29 (last — 29-day month)
    [2027,  2, 13, 11,  1],   // Falgun 1
    [2027,  3, 14, 11, 30],   // Falgun 30 (last)
    [2027,  3, 15, 12,  1],   // Chaitra 1
    [2027,  4, 13, 12, 30],   // Chaitra 30 (last)
  ]

  for (const [ay, am, ad, bm, bd] of bs2083Months) {
    it(`[H] BS 2083: AD ${ay}-${am}-${ad} = BS 2083-${bm}-${bd}`, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: 2083, month: bm, day: bd })
    })
  }

  // ── BS 2062 — all 12 months (JS lib had Baisakh=30, Jestha=32 — wrong) ───

  const bs2062Months: Array<[number, number, number, number, number]> = [
    [2005,  4, 14,  1,  1],   // Baisakh 1
    [2005,  5, 13,  1, 30],   // Baisakh 30
    [2005,  5, 14,  1, 31],   // Baisakh 31 (last — 31 days NOT 30) [H]
    [2005,  5, 15,  2,  1],   // Jestha 1 [H]
    [2005,  6, 14,  2, 31],   // Jestha 31 (last — 31 days NOT 32) [H]
    [2005,  6, 15,  3,  1],   // Ashadh 1 [H]
    [2005,  7, 15,  3, 31],   // Ashadh 31 (last)
    [2005,  7, 16,  4,  1],   // Shrawan 1
    [2005,  8, 16,  4, 32],   // Shrawan 32 (last — 32-day month)
    [2005,  8, 17,  5,  1],   // Bhadra 1
    [2005,  9, 16,  5, 31],   // Bhadra 31 (last)
    [2005,  9, 17,  6,  1],   // Ashwin 1
    [2005, 10, 17,  6, 31],   // Ashwin 31 (last)
    [2005, 10, 18,  7,  1],   // Kartik 1
    [2005, 11, 15,  7, 29],   // Kartik 29 (last)
    [2005, 11, 16,  8,  1],   // Mangsir 1
    [2005, 12, 15,  8, 30],   // Mangsir 30 (last)
    [2005, 12, 16,  9,  1],   // Poush 1
    [2006,  1, 13,  9, 29],   // Poush 29 (last)
    [2006,  1, 14, 10,  1],   // Magh 1
    [2006,  2, 12, 10, 30],   // Magh 30 (last)
    [2006,  2, 13, 11,  1],   // Falgun 1
    [2006,  3, 13, 11, 29],   // Falgun 29 (last)
    [2006,  3, 14, 12,  1],   // Chaitra 1
    [2006,  4, 13, 12, 31],   // Chaitra 31 (last)
  ]

  for (const [ay, am, ad, bm, bd] of bs2062Months) {
    it(`BS 2062: AD ${ay}-${am}-${ad} = BS 2062-${bm}-${bd}`, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: 2062, month: bm, day: bd })
    })
  }

  // ── BS 2087 — all 12 months (both libs had wrong month lengths) ───────────

  const bs2087Months: Array<[number, number, number, number, number, number]> = [
    [2030,  4, 14, 2087,  1,  1],   // Baisakh 1
    [2030,  5, 14, 2087,  1, 31],   // Baisakh 31 (last)
    [2030,  5, 15, 2087,  2,  1],   // Jestha 1
    [2030,  6, 14, 2087,  2, 31],   // Jestha 31 (last)
    [2030,  6, 15, 2087,  3,  1],   // Ashadh 1
    [2030,  7, 16, 2087,  3, 32],   // Ashadh 32 (last)
    [2030,  7, 17, 2087,  4,  1],   // Shrawan 1
    [2030,  8, 16, 2087,  4, 31],   // Shrawan 31 (last)
    [2030,  8, 17, 2087,  5,  1],   // Bhadra 1
    [2030,  9, 16, 2087,  5, 31],   // Bhadra 31 (last)
    [2030,  9, 17, 2087,  6,  1],   // Ashwin 1
    [2030, 10, 17, 2087,  6, 31],   // Ashwin 31 (last)
    [2030, 10, 18, 2087,  7,  1],   // Kartik 1
    [2030, 11, 16, 2087,  7, 30],   // Kartik 30 (last)
    [2030, 11, 17, 2087,  8,  1],   // Mangsir 1
    [2030, 12, 15, 2087,  8, 29],   // Mangsir 29 [H]
    [2030, 12, 16, 2087,  8, 30],   // Mangsir 30 (last — 30 NOT 29) [H][A]
    [2030, 12, 17, 2087,  9,  1],   // Poush 1 [H]
    [2031,  1, 14, 2087,  9, 29],   // Poush 29 [H]
    [2031,  1, 15, 2087,  9, 30],   // Poush 30 (last — 30 NOT 29) [H][A]
    [2031,  1, 16, 2087, 10,  1],   // Magh 1 [H]
    [2031,  2, 14, 2087, 10, 30],   // Magh 30 (last)
    [2031,  2, 15, 2087, 11,  1],   // Falgun 1
    [2031,  3, 16, 2087, 11, 30],   // Falgun 30 (last)
    [2031,  3, 17, 2087, 12,  1],   // Chaitra 1
    [2031,  4, 15, 2087, 12, 30],   // Chaitra 30 (last)
    [2031,  4, 16, 2088,  1,  1],   // BS 2088 Baisakh 1 — confirms 2087=367 [A]
  ]

  for (const [ay, am, ad, by, bm, bd] of bs2087Months) {
    it(`BS 2087: AD ${ay}-${am}-${ad} = BS ${by}-${bm}-${bd}`, () => {
      expect(adToBs(ay, am, ad)).toEqual({ year: by, month: bm, day: bd })
    })
  }

  // ── Adjacent year rollover checks ─────────────────────────────────────────

  it('last day of BS 2061 → first day of BS 2062', () => {
    expect(adToBs(2005, 4, 13)).toEqual({ year: 2061, month: 12, day: 31 })
    expect(adToBs(2005, 4, 14)).toEqual({ year: 2062, month:  1, day:  1 })
  })

  it('last day of BS 2062 → first day of BS 2063', () => {
    expect(adToBs(2006, 4, 13)).toEqual({ year: 2062, month: 12, day: 31 })
    expect(adToBs(2006, 4, 14)).toEqual({ year: 2063, month:  1, day:  1 })
  })

  it('last day of BS 2087 (367 days) → first day of BS 2088', () => {
    expect(adToBs(2031, 4, 15)).toEqual({ year: 2087, month: 12, day: 30 })
    expect(adToBs(2031, 4, 16)).toEqual({ year: 2088, month:  1, day:  1 })
  })

  // ── Range errors ──────────────────────────────────────────────────────────

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

  it('min valid: AD 1918-04-13 succeeds', () => {
    expect(adToBs(1918, 4, 13)).toEqual({ year: 1975, month: 1, day: 1 })
  })

  it('max valid: AD 2044-04-13 succeeds', () => {
    expect(adToBs(2044, 4, 13)).toEqual({ year: 2100, month: 12, day: 30 })
  })
})

// ---------------------------------------------------------------------------
// bsToAd
// ---------------------------------------------------------------------------

describe('bsToAd', () => {

  // ── Reference & known spot checks ─────────────────────────────────────────

  it('[H] reference anchor: BS 1975-01-01 = AD 1918-04-13', () => {
    expect(bsToAd(1975, 1, 1)).toEqual({ year: 1918, month: 4, day: 13 })
  })

  it('[H] today: BS 2083-05-11 = AD 2026-08-27', () => {
    expect(bsToAd(2083, 5, 11)).toEqual({ year: 2026, month: 8, day: 27 })
  })

  // ── Hamropatro-verified key dates ─────────────────────────────────────────

  it('[H] BS 2062-01-31 = AD 2005-05-14 (Baisakh=31 days)', () => {
    expect(bsToAd(2062, 1, 31)).toEqual({ year: 2005, month: 5, day: 14 })
  })

  it('[H] BS 2062-02-01 = AD 2005-05-15', () => {
    expect(bsToAd(2062, 2, 1)).toEqual({ year: 2005, month: 5, day: 15 })
  })

  it('[H] BS 2062-02-31 = AD 2005-06-14 (Jestha=31 days)', () => {
    expect(bsToAd(2062, 2, 31)).toEqual({ year: 2005, month: 6, day: 14 })
  })

  it('[H] BS 2062-03-01 = AD 2005-06-15', () => {
    expect(bsToAd(2062, 3, 1)).toEqual({ year: 2005, month: 6, day: 15 })
  })

  it('[H][A] BS 2087-08-30 = AD 2030-12-16 (Mangsir=30 days)', () => {
    expect(bsToAd(2087, 8, 30)).toEqual({ year: 2030, month: 12, day: 16 })
  })

  it('[H] BS 2087-09-01 = AD 2030-12-17 (Poush starts)', () => {
    expect(bsToAd(2087, 9, 1)).toEqual({ year: 2030, month: 12, day: 17 })
  })

  it('[H][A] BS 2087-09-30 = AD 2031-01-15 (Poush=30 days)', () => {
    expect(bsToAd(2087, 9, 30)).toEqual({ year: 2031, month: 1, day: 15 })
  })

  it('[H] BS 2087-10-01 = AD 2031-01-16 (Magh starts)', () => {
    expect(bsToAd(2087, 10, 1)).toEqual({ year: 2031, month: 1, day: 16 })
  })

  it('[A] BS 2088-01-01 = AD 2031-04-16 (confirms BS 2087 = 367 days)', () => {
    expect(bsToAd(2088, 1, 1)).toEqual({ year: 2031, month: 4, day: 16 })
  })

  // ── Range boundaries ──────────────────────────────────────────────────────

  it('min: BS 1975-01-01 = AD 1918-04-13', () => {
    expect(bsToAd(1975, 1, 1)).toEqual({ year: 1918, month: 4, day: 13 })
  })

  it('max: BS 2100-12-30 = AD 2044-04-13', () => {
    expect(bsToAd(2100, 12, 30)).toEqual({ year: 2044, month: 4, day: 13 })
  })

  // ── Validation errors ─────────────────────────────────────────────────────

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

  // ── All 12 months of BS 2083 (current year) ───────────────────────────────

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

  // ── Known corrected months ────────────────────────────────────────────────

  it('[H] BS 2062 Baisakh = 31 days (JS lib had 30)', () => {
    expect(daysInMonth(2062, 1)).toBe(31)
  })

  it('[H] BS 2062 Jestha = 31 days (JS lib had 32)', () => {
    expect(daysInMonth(2062, 2)).toBe(31)
  })

  it('[H][A] BS 2087 Mangsir = 30 days (Python lib had 29)', () => {
    expect(daysInMonth(2087, 8)).toBe(30)
  })

  it('[H][A] BS 2087 Poush = 30 days (JS lib had 29)', () => {
    expect(daysInMonth(2087, 9)).toBe(30)
  })

  // ── Various years ─────────────────────────────────────────────────────────

  it('BS 1975 month 3 (Ashadh) = 32 days', () => {
    expect(daysInMonth(1975, 3)).toBe(32)
  })

  it('BS 2000 month 1 (Baisakh) = 30 days', () => {
    expect(daysInMonth(2000, 1)).toBe(30)
  })

  it('BS 2100 month 12 (Chaitra) = 30 days (last month of last year)', () => {
    expect(daysInMonth(2100, 12)).toBe(30)
  })

  // ── Errors ────────────────────────────────────────────────────────────────

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

  it('[H][A] BS 2087 = 367 days total', () => {
    expect(CALENDAR[2087]!.reduce((a, b) => a + b, 0)).toBe(367)
  })

  it('[H][A] BS 2087 month 8 (Mangsir) = 30 days', () => {
    expect(CALENDAR[2087]![7]).toBe(30)
  })

  it('[H][A] BS 2087 month 9 (Poush) = 30 days', () => {
    expect(CALENDAR[2087]![8]).toBe(30)
  })

  it('[H] BS 2062 month 1 (Baisakh) = 31 days', () => {
    expect(CALENDAR[2062]![0]).toBe(31)
  })

  it('[H] BS 2062 month 2 (Jestha) = 31 days', () => {
    expect(CALENDAR[2062]![1]).toBe(31)
  })

  it('MIN_BS_YEAR = 1975', () => {
    expect(MIN_BS_YEAR).toBe(1975)
  })

  it('MAX_BS_YEAR = 2100', () => {
    expect(MAX_BS_YEAR).toBe(2100)
  })
})
