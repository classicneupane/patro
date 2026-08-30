# patro

Nepali Bikram Sambat (BS) ↔ Gregorian (AD) date converter.

- **Coverage:** BS 1975–2100 / AD 1918–2044 (46,023 days)
- **Zero dependencies** — pure TypeScript and pure Python

Full API specification: [docs/spec.md](docs/spec.md)

---

## Installation

### Python

```bash
# from PyPI (once published)
pip install patro
# or with uv
uv add patro

# from local source right now
pip install ./packages/python
# or
uv add ./packages/python
```

### JavaScript / TypeScript

```bash
# from npm (once published — remove "private": true from packages/js/package.json first)
npm install patro
# or
pnpm add patro

# from local source right now: build first, then install
cd packages/js && pnpm build
# then in your app:
npm install /path/to/patro/packages/js
```

---

## Usage

### Python

```python
from patro import ad_to_bs, bs_to_ad, days_in_month, is_valid_bs

# AD → BS
bs_year, bs_month, bs_day = ad_to_bs(2026, 8, 27)
# → (2083, 5, 11)

# BS → AD  (returns datetime.date)
from datetime import date
ad_date = bs_to_ad(2083, 5, 11)
# → date(2026, 8, 27)

# days in a BS month
days_in_month(2083, 3)   # → 32  (Ashadh 2083 has 32 days)

# validate a BS date
is_valid_bs(2083, 13, 1)  # → False (no month 13)
is_valid_bs(2083,  5, 11) # → True
```

### TypeScript / JavaScript

```ts
import { adToBs, bsToAd, daysInMonth, isValidBs } from 'patro'

// AD → BS
adToBs(2026, 8, 27)
// → { year: 2083, month: 5, day: 11 }

// BS → AD
bsToAd(2083, 5, 11)
// → { year: 2026, month: 8, day: 27 }

// days in a BS month
daysInMonth(2083, 3)   // → 32

// validate a BS date
isValidBs(2083, 13, 1)  // → false
isValidBs(2083,  5, 11) // → true
```

---

## API

See [docs/spec.md](docs/spec.md) for the full specification. Quick reference:

| Function | JS/TS | Python | Returns |
|---|---|---|---|
| Convert AD → BS | `adToBs(y, m, d)` | `ad_to_bs(y, m, d)` | BS date |
| Convert BS → AD | `bsToAd(y, m, d)` | `bs_to_ad(y, m, d)` | AD date |
| Days in month | `daysInMonth(y, m)` | `days_in_month(y, m)` | `int` |
| Validate BS date | `isValidBs(y, m, d)` | `is_valid_bs(y, m, d)` | `bool` |
| Today in BS | `todayBs()` | `today_bs()` | BS date |
| Parse BS string | `parseBs(s)` | `parse_bs(s)` | BS date |
| Format BS string | `bsDateToString(d)` | `bs_date_to_string(y, m, d)` | `str` |
| Parse AD string | `parseAd(s)` | `parse_ad(s)` | AD date |
| Day of week | `dayOfWeekBs(y, m, d)` | `day_of_week_bs(y, m, d)` | `int` (0=Sun) |
| Days in year | `daysInYear(y)` | `days_in_year(y)` | `int` |
| Compare BS dates | `compareBs(a, b)` | `compare_bs(a, b)` | `-1 \| 0 \| 1` |
| Nepali digits | `toNepaliDigits(n)` | `to_nepali_digits(n)` | `str` |
| Next month | `nextBsMonth(y, m)` | `next_bs_month(y, m)` | year+month |
| Prev month | `prevBsMonth(y, m)` | `prev_bs_month(y, m)` | year+month |

**Supported range:** BS 1975-01-01 (AD 1918-04-13) → BS 2100-12-30 (AD 2044-04-13)

Out-of-range inputs throw `RangeError` (JS) or `ValueError` (Python).

---

## Publishing

### To PyPI

```bash
cd packages/python
uv build
uv publish          # needs PyPI token
```

### To npm

1. Remove `"private": true` from `packages/js/package.json`
2. Build and publish:

```bash
cd packages/js
pnpm build
npm publish
```

---

## Development

```bash
# install dependencies
pnpm install                          # JS
uv sync --dev                         # Python (inside packages/python)

# run tests
cd packages/js     && pnpm test
cd packages/python && uv run pytest

# build JS
cd packages/js && pnpm build
```

Test data (shared between both test suites): `testdata/pairs.json`
