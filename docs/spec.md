# patro — API Specification

This document is the canonical definition of the `patro` API.
Both the JavaScript/TypeScript and Python packages must expose everything listed here.

---

## Supported range

| Boundary | BS | AD |
|---|---|---|
| Minimum | 1975-01-01 | 1918-04-13 |
| Maximum | 2100-12-30 | 2044-04-13 |

Total: 46,023 days.

---

## Constants

| Name | Type | Value |
|---|---|---|
| `MIN_BS_YEAR` | `int` | `1975` |
| `MAX_BS_YEAR` | `int` | `2100` |
| `CALENDAR` | `Record<year, months[12]>` | month-day counts for every BS year |
| `MONTH_NAMES` | `string[12]` | English romanised names (deprecated alias for `MONTH_NAMES_EN`) |
| `MONTH_NAMES_EN` | `string[12]` | `['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra']` |
| `MONTH_NAMES_NP` | `string[12]` | Devanagari names: `['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत']` |
| `DAY_NAMES_EN` | `string[7]` | `['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']` |
| `DAY_NAMES_EN_SHORT` | `string[7]` | `['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']` |
| `DAY_NAMES_NP` | `string[7]` | `['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार']` |
| `DAY_NAMES_NP_SHORT` | `string[7]` | `['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि']` |

Day index: `0 = Sunday … 6 = Saturday`.

---

## Date types

Each implementation uses its language's idiomatic representation:

| Concept | JS/TS | Python |
|---|---|---|
| BS date | `{ year: number, month: number, day: number }` | `tuple[int, int, int]` |
| AD date | `{ year: number, month: number, day: number }` | `datetime.date` |

---

## Core conversion functions

### `adToBs` / `ad_to_bs(year, month, day)`

Convert a Gregorian (AD) date to Bikram Sambat (BS).

- **Returns:** BS date
- **Throws:** if the input is before AD 1918-04-13 or after AD 2044-04-13

### `bsToAd` / `bs_to_ad(year, month, day)`

Convert a Bikram Sambat (BS) date to Gregorian (AD).

- **Returns:** AD date
- **Throws:** if the BS date is invalid or out of range

### `daysInMonth` / `days_in_month(year, month)`

Return the number of days in a given BS year and month.

- **Returns:** `int` (29–32)
- **Throws:** if year is outside `[MIN_BS_YEAR, MAX_BS_YEAR]` or month outside `[1, 12]`

### `isValidBs` / `is_valid_bs(year, month, day)`

Return whether a BS date is valid (within range and day ≤ days in that month).

- **Returns:** `bool`
- **Throws:** never

---

## Utility functions

### `toNepaliDigits` / `to_nepali_digits(n)`

Convert ASCII digits in a number or string to Nepali Devanagari digit characters (०–९).

- **Input:** `int | str`
- **Returns:** `str`

### `todayBs` / `today_bs()`

Return today's date in BS using local system time.

- **Returns:** BS date

### `nextBsMonth` / `next_bs_month(year, month)`

Return the month following the given BS year/month, rolling over to the next year at month 12.

- **Returns:** `{ year, month }` / `tuple[int, int]`

### `prevBsMonth` / `prev_bs_month(year, month)`

Return the month preceding the given BS year/month, rolling back to the previous year at month 1.

- **Returns:** `{ year, month }` / `tuple[int, int]`

### `parseBs` / `parse_bs(date_str)`

Parse a BS date string in `YYYY-MM-DD` format.

- **Returns:** BS date
- **Throws:** if the string is malformed or the date is out of range

### `bsDateToString` / `bs_date_to_string(year, month, day)`

Format a BS date as a zero-padded `YYYY-MM-DD` string. This is the canonical string form for serialisation (database fields, APIs).

- **Input (JS):** `BsDate` object; **(Python):** three separate `int` args
- **Returns:** `str`

### `parseAd` / `parse_ad(date_str)`

Parse an AD date string in `YYYY-MM-DD` format.

- **Returns:** AD date
- **Throws:** if the string is malformed or the date parts are invalid

### `dayOfWeekBs` / `day_of_week_bs(year, month, day)`

Return the day of week for a BS date.

- **Returns:** `int`, `0 = Sunday … 6 = Saturday`

### `daysInYear` / `days_in_year(year)`

Return the total number of days in a BS year (365–367).

- **Returns:** `int`
- **Throws:** if year is outside `[MIN_BS_YEAR, MAX_BS_YEAR]`

### `compareBs` / `compare_bs(a, b)`

Compare two BS dates.

- **Input:** two BS dates
- **Returns:** `-1` if `a < b`, `0` if equal, `1` if `a > b`

---

## Error types

| Language | Out-of-range / invalid input |
|---|---|
| JavaScript | `RangeError` |
| Python | `ValueError` |

---

## Test data

`testdata/pairs.json` at the monorepo root is the shared source of truth for conversion pairs, used by both test suites. Pairs marked `[✓]` or `[✓✓]` were cross-verified against external reference implementations.
