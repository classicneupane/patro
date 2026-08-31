# patro

**Nepali Bikram Sambat (BS) ↔ Gregorian (AD) date converter — Python and JavaScript.**

![not yet published](https://img.shields.io/badge/PyPI-not%20yet%20published-lightgrey)
![not yet published](https://img.shields.io/badge/npm-not%20yet%20published-lightgrey)
[![Python ≥ 3.11](https://img.shields.io/badge/python-%E2%89%A53.11-blue)](https://www.python.org/)

Zero dependencies. Correct calendar data. Covers **BS 1975–2100** (AD 1918–2044).

> **Note:** This package has not yet been published to PyPI or npm. Install from source (see [Development](#development) below).

---

## Install

> PyPI and npm releases are coming soon. For now, install from source.

```bash
# Python
git clone https://github.com/classicneupane/patro.git
cd patro/packages/python
uv sync
uv pip install -e .

# JavaScript / TypeScript
git clone https://github.com/classicneupane/patro.git
cd patro/packages/js
pnpm install
pnpm build
```

---

## Quick start

### Python

```python
from patro import ad_to_bs, bs_to_ad, today_bs, parse_bs, format_bs

ad_to_bs(2026, 8, 27)      # → (2083, 5, 11)
bs_to_ad(2083, 5, 11)      # → datetime.date(2026, 8, 27)
today_bs()                 # → (2083, 5, 11)
parse_bs("2083-05-11")     # → (2083, 5, 11)
format_bs(2083, 5, 11)     # → "2083-05-11"
```

### JavaScript / TypeScript

```ts
import { adToBs, bsToAd, todayBs, parseBs, formatBs } from 'patro'

adToBs(2026, 8, 27)                           // → { year: 2083, month: 5, day: 11 }
bsToAd(2083, 5, 11)                           // → { year: 2026, month: 8, day: 27 }
todayBs()                                     // → { year: 2083, month: 5, day: 11 }
parseBs("2083-05-11")                         // → { year: 2083, month: 5, day: 11 }
formatBs({ year: 2083, month: 5, day: 11 })  // → "2083-05-11"
```

---

## API reference

Functions follow snake_case in Python and camelCase in JS/TS. Where signatures differ between languages they are noted explicitly.

### Date types

| | Python | JS / TS |
|---|---|---|
| BS date | `tuple[int, int, int]` — `(year, month, day)` | `BsDate` — `{ year: number, month: number, day: number }` |
| AD date | `datetime.date` | `AdDate` — `{ year: number, month: number, day: number }` |

---

### Conversion

#### `ad_to_bs` / `adToBs`

Convert an AD (Gregorian) date to BS (Bikram Sambat).

```python
# Python
ad_to_bs(year: int, month: int, day: int) -> tuple[int, int, int]

ad_to_bs(2026, 8, 27)   # → (2083, 5, 11)
ad_to_bs(1918, 4, 13)   # → (1975, 1, 1)   — minimum supported date
ad_to_bs(2044, 4, 13)   # → (2100, 12, 30) — maximum supported date
```

```ts
// JavaScript / TypeScript
adToBs(year: number, month: number, day: number): BsDate

adToBs(2026, 8, 27)   // → { year: 2083, month: 5, day: 11 }
```

Raises `ValueError` (Python) / `RangeError` (JS) if the date is outside the supported range.

---

#### `bs_to_ad` / `bsToAd`

Convert a BS date to AD (Gregorian).

```python
# Python — returns datetime.date
bs_to_ad(year: int, month: int, day: int) -> datetime.date

bs_to_ad(2083, 5, 11)   # → datetime.date(2026, 8, 27)
```

```ts
// JavaScript / TypeScript — returns AdDate object
bsToAd(year: number, month: number, day: number): AdDate

bsToAd(2083, 5, 11)   // → { year: 2026, month: 8, day: 27 }
```

Raises `ValueError` / `RangeError` for invalid or out-of-range inputs.

---

### Validation

#### `days_in_month` / `daysInMonth`

Return the number of days in a BS month (29–32).

```python
days_in_month(year: int, month: int) -> int

days_in_month(2083, 1)   # → 31
days_in_month(2083, 3)   # → 32
days_in_month(2083, 8)   # → 29
```

```ts
daysInMonth(year: number, month: number): number
```

Raises if year or month is out of range.

---

#### `is_valid_bs` / `isValidBs`

Return `True`/`true` if the BS date exists in the calendar, `False`/`false` otherwise. Never raises.

```python
is_valid_bs(year: int, month: int, day: int) -> bool

is_valid_bs(2083, 3, 32)   # → True  (Ashadh 2083 has 32 days)
is_valid_bs(2083, 8, 30)   # → False (Mangsir 2083 has only 29 days)
is_valid_bs(1974, 1, 1)    # → False (year out of range)
```

```ts
isValidBs(year: number, month: number, day: number): boolean
```

---

#### `days_in_year` / `daysInYear`

Return the total number of days in a BS year (365–367).

```python
days_in_year(year: int) -> int

days_in_year(2083)   # → 365
days_in_year(2087)   # → 367
```

```ts
daysInYear(year: number): number
```

---

### Utilities

#### `today_bs` / `todayBs`

Return today's date in BS using the local system clock.

```python
today_bs() -> tuple[int, int, int]
```

```ts
todayBs(): BsDate
```

---

#### `format_bs` / `formatBs`

Format a BS date as a zero-padded `YYYY-MM-DD` string.

> **Signature differs between languages.**

```python
# Python — takes year, month, day as separate arguments
format_bs(year: int, month: int, day: int) -> str

format_bs(2083, 5, 11)   # → "2083-05-11"
format_bs(1975, 1, 1)    # → "1975-01-01"
```

```ts
// JavaScript — takes a BsDate object
formatBs(date: BsDate): string

formatBs({ year: 2083, month: 5, day: 11 })   // → "2083-05-11"
```

---

#### `parse_bs` / `parseBs`

Parse a `YYYY-MM-DD` string into a BS date. Raises if the string is malformed or the date is invalid.

```python
parse_bs(date_str: str) -> tuple[int, int, int]

parse_bs("2083-05-11")   # → (2083, 5, 11)
```

```ts
parseBs(dateStr: string): BsDate

parseBs("2083-05-11")   // → { year: 2083, month: 5, day: 11 }
```

---

#### `parse_ad` / `parseAd`

Parse a `YYYY-MM-DD` string into an AD date. Raises if the string is malformed or the date is invalid.

```python
parse_ad(date_str: str) -> datetime.date

parse_ad("2026-08-27")   # → datetime.date(2026, 8, 27)
```

```ts
parseAd(dateStr: string): AdDate

parseAd("2026-08-27")   // → { year: 2026, month: 8, day: 27 }
```

---

#### `to_nepali_digits` / `toNepaliDigits`

Convert ASCII digits in a number or string to Nepali Devanagari digits.

```python
to_nepali_digits(n: int | str) -> str

to_nepali_digits(2083)      # → "२०८३"
to_nepali_digits("2083-05-11")  # → "२०८३-०५-११"
```

```ts
toNepaliDigits(n: number | string): string

toNepaliDigits(2083)         // → "२०८३"
toNepaliDigits("2083-05-11") // → "२०८३-०५-११"
```

---

#### `day_of_week_bs` / `dayOfWeekBs`

Return the day of week for a BS date. **0 = Sunday, 6 = Saturday.**

```python
day_of_week_bs(year: int, month: int, day: int) -> int

day_of_week_bs(2083, 5, 11)   # → 3  (Wednesday, 2026-08-27)
```

```ts
dayOfWeekBs(year: number, month: number, day: number): number
```

---

#### `next_bs_month` / `nextBsMonth`

Return the next BS month, rolling over year boundaries.

```python
next_bs_month(year: int, month: int) -> tuple[int, int]

next_bs_month(2083, 12)   # → (2084, 1)
next_bs_month(2083, 5)    # → (2083, 6)
```

```ts
nextBsMonth(year: number, month: number): { year: number; month: number }
```

---

#### `prev_bs_month` / `prevBsMonth`

Return the previous BS month, rolling back year boundaries.

```python
prev_bs_month(year: int, month: int) -> tuple[int, int]

prev_bs_month(2083, 1)   # → (2082, 12)
prev_bs_month(2083, 5)   # → (2083, 4)
```

```ts
prevBsMonth(year: number, month: number): { year: number; month: number }
```

---

### Comparison

> **Signature differs between languages.**  
> Python functions take `(y, m, d)` tuples. JS functions take `BsDate` objects.

#### `compare_bs` / `compareBs`

Compare two BS dates. Returns `-1` if `a < b`, `0` if equal, `1` if `a > b`.

```python
import functools
compare_bs(a: tuple[int, int, int], b: tuple[int, int, int]) -> int

compare_bs((2083, 5, 10), (2083, 5, 11))   # → -1
# sort usage:
sorted(dates, key=functools.cmp_to_key(compare_bs))
```

```ts
compareBs(a: BsDate, b: BsDate): -1 | 0 | 1

compareBs({ year: 2083, month: 5, day: 10 }, { year: 2083, month: 5, day: 11 })  // → -1
// sort usage:
dates.sort(compareBs)
```

---

#### `is_before` / `isBefore`

```python
is_before(a: tuple[int, int, int], b: tuple[int, int, int]) -> bool

is_before((2083, 5, 10), (2083, 5, 11))   # → True
```

```ts
isBefore(a: BsDate, b: BsDate): boolean
```

---

#### `is_after` / `isAfter`

```python
is_after(a: tuple[int, int, int], b: tuple[int, int, int]) -> bool

is_after((2083, 5, 11), (2083, 5, 10))   # → True
```

```ts
isAfter(a: BsDate, b: BsDate): boolean
```

---

#### `is_equal` / `isEqual`

```python
is_equal(a: tuple[int, int, int], b: tuple[int, int, int]) -> bool

is_equal((2083, 5, 11), (2083, 5, 11))   # → True
```

```ts
isEqual(a: BsDate, b: BsDate): boolean
```

---

### Constants

```python
from patro import (
    MIN_BS_YEAR,          # 1975
    MAX_BS_YEAR,          # 2100
    MONTH_NAMES_EN,       # ['Baisakh', 'Jestha', ...]
    MONTH_NAMES_NP,       # ['बैशाख', 'जेठ', ...]
    DAY_NAMES_EN,         # ['Sunday', 'Monday', ...]
    DAY_NAMES_EN_SHORT,   # ['Sun', 'Mon', ...]
    DAY_NAMES_NP,         # ['आइतबार', 'सोमबार', ...]
    DAY_NAMES_NP_SHORT,   # ['आइत', 'सोम', ...]
    CALENDAR,             # dict[int, list[int]] — days per month, keyed by BS year
)
```

```ts
import {
  MIN_BS_YEAR,          // 1975
  MAX_BS_YEAR,          // 2100
  MONTH_NAMES_EN,       // readonly string[]
  MONTH_NAMES_NP,       // readonly string[]
  DAY_NAMES_EN,         // readonly string[]
  DAY_NAMES_EN_SHORT,   // readonly string[]
  DAY_NAMES_NP,         // readonly string[]
  DAY_NAMES_NP_SHORT,   // readonly string[]
  CALENDAR,             // Record<number, readonly [×12]> — days per month, keyed by BS year
} from 'patro'
```

| Constant | Values |
|---|---|
| `MONTH_NAMES_EN` | `Baisakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra` |
| `MONTH_NAMES_NP` | `बैशाख, जेठ, असार, साउन, भदौ, असोज, कार्तिक, मंसिर, पुस, माघ, फागुन, चैत` |
| `DAY_NAMES_EN` | `Sunday … Saturday` |
| `DAY_NAMES_EN_SHORT` | `Sun … Sat` |
| `DAY_NAMES_NP` | `आइतबार … शनिबार` |
| `DAY_NAMES_NP_SHORT` | `आइत … शनि` |

Day index: **0 = Sunday, 6 = Saturday.**

---

## Error handling

| Situation | Python | JS / TS |
|---|---|---|
| AD date out of range | `ValueError` | `RangeError` |
| BS year out of range | `ValueError` | `RangeError` |
| BS month out of range | `ValueError` | `RangeError` |
| BS day out of range | `ValueError` | `RangeError` |
| Malformed date string | `ValueError` | `RangeError` |
| `is_valid_bs` / `isValidBs` | returns `False` — never raises | returns `false` — never raises |

---

## Supported range

| | BS | AD |
|---|---|---|
| Minimum | 1975-01-01 | 1918-04-13 |
| Maximum | 2100-12-30 | 2044-04-13 |

---

## Development

```bash
# Python
cd packages/python
uv sync --dev
uv run pytest

# JavaScript / TypeScript
cd packages/js
pnpm install
pnpm build
pnpm test
```

Shared test data for both suites: [`testdata/cases.json`](testdata/cases.json)
