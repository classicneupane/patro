# patro

**Nepali Bikram Sambat (BS) ↔ Gregorian (AD) date converter — Python and JavaScript.**

[![PyPI](https://img.shields.io/pypi/v/patro)](https://pypi.org/project/patro/)
[![npm](https://img.shields.io/npm/v/patro)](https://www.npmjs.com/package/patro)
[![Python ≥ 3.11](https://img.shields.io/pypi/pyversions/patro)](https://pypi.org/project/patro/)

Zero dependencies. Correct calendar data. Identical API across both ecosystems.  
Covers **BS 1975–2100** (AD 1918–2044) — 46,023 days.

---

## Install

```bash
# Python
pip install patro

# JavaScript / TypeScript
npm install patro
```

---

## Usage

### Python

```python
from patro import ad_to_bs, bs_to_ad, today_bs, parse_bs, bs_date_to_string

# AD → BS
ad_to_bs(2026, 8, 27)           # → (2083, 5, 11)

# BS → AD  (returns datetime.date)
bs_to_ad(2083, 5, 11)           # → date(2026, 8, 27)

# today in BS
today_bs()                      # → (2083, 5, 14)

# parse / format strings
parse_bs("2083-05-11")          # → (2083, 5, 11)
bs_date_to_string(2083, 5, 11)  # → "2083-05-11"
```

### TypeScript / JavaScript

```ts
import { adToBs, bsToAd, todayBs, parseBs, bsDateToString } from 'patro'

// AD → BS
adToBs(2026, 8, 27)             // → { year: 2083, month: 5, day: 11 }

// BS → AD
bsToAd(2083, 5, 11)             // → { year: 2026, month: 8, day: 27 }

// today in BS
todayBs()                       // → { year: 2083, month: 5, day: 14 }

// parse / format strings
parseBs("2083-05-11")           // → { year: 2083, month: 5, day: 11 }
bsDateToString({ year: 2083, month: 5, day: 11 }) // → "2083-05-11"
```

---

## API

Both packages expose the same functions — snake_case in Python, camelCase in JS/TS.

| | JS/TS | Python | Returns |
|---|---|---|---|
| **Conversion** | | | |
| AD → BS | `adToBs(y, m, d)` | `ad_to_bs(y, m, d)` | BS date |
| BS → AD | `bsToAd(y, m, d)` | `bs_to_ad(y, m, d)` | AD date |
| **Validation** | | | |
| Days in month | `daysInMonth(y, m)` | `days_in_month(y, m)` | `int` |
| Validate BS date | `isValidBs(y, m, d)` | `is_valid_bs(y, m, d)` | `bool` |
| Days in year | `daysInYear(y)` | `days_in_year(y)` | `int` |
| **Utilities** | | | |
| Today in BS | `todayBs()` | `today_bs()` | BS date |
| Parse BS string | `parseBs(s)` | `parse_bs(s)` | BS date |
| Format BS string | `bsDateToString(d)` | `bs_date_to_string(y, m, d)` | `str` |
| Parse AD string | `parseAd(s)` | `parse_ad(s)` | AD date |
| Day of week | `dayOfWeekBs(y, m, d)` | `day_of_week_bs(y, m, d)` | `int` (0 = Sun) |
| Compare dates | `compareBs(a, b)` | `compare_bs(a, b)` | `-1 \| 0 \| 1` |
| Next month | `nextBsMonth(y, m)` | `next_bs_month(y, m)` | year, month |
| Prev month | `prevBsMonth(y, m)` | `prev_bs_month(y, m)` | year, month |
| **i18n** | | | |
| Nepali digits | `toNepaliDigits(n)` | `to_nepali_digits(n)` | `str` |

Out-of-range inputs throw `RangeError` (JS) or `ValueError` (Python).

### Date types

| | Python | JS/TS |
|---|---|---|
| BS date | `tuple[int, int, int]` | `{ year, month, day }` |
| AD date | `datetime.date` | `{ year, month, day }` |

### Constants

```python
from patro import (
    MIN_BS_YEAR, MAX_BS_YEAR,     # 1975, 2100
    MONTH_NAMES_EN, MONTH_NAMES_NP,
    DAY_NAMES_EN, DAY_NAMES_EN_SHORT,
    DAY_NAMES_NP,  DAY_NAMES_NP_SHORT,
)
```

```ts
import {
  MIN_BS_YEAR, MAX_BS_YEAR,      // 1975, 2100
  MONTH_NAMES_EN, MONTH_NAMES_NP,
  DAY_NAMES_EN, DAY_NAMES_EN_SHORT,
  DAY_NAMES_NP,  DAY_NAMES_NP_SHORT,
} from 'patro'
```

| Constant | Example values |
|---|---|
| `MONTH_NAMES_EN` | `Baisakh, Jestha, Ashadh, Shrawan, …` |
| `MONTH_NAMES_NP` | `बैशाख, जेठ, असार, साउन, …` |
| `DAY_NAMES_EN` | `Sunday, Monday, …, Saturday` |
| `DAY_NAMES_EN_SHORT` | `Sun, Mon, …, Sat` |
| `DAY_NAMES_NP` | `आइतबार, सोमबार, …, शनिबार` |
| `DAY_NAMES_NP_SHORT` | `आइत, सोम, …, शनि` |

Day index: 0 = Sunday … 6 = Saturday.

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

# JavaScript
cd packages/js
pnpm install
pnpm test
```

Shared test data (used by both suites): [`testdata/pairs.json`](testdata/pairs.json)
# patro
