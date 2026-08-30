"""
Comprehensive tests for the patro Nepali BS <-> AD date converter.

Conversion pairs are loaded from testdata/pairs.json at the monorepo root —
a single source of truth shared with the TypeScript test suite.

Test pairs marked [✓] or [✓✓] were cross-verified against external reference implementations.
"""

import json
import pytest
from datetime import date
from pathlib import Path

from patro import (
    ad_to_bs, bs_to_ad, days_in_month, is_valid_bs,
    CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR,
    format_bs, parse_bs, compare_bs, is_before, is_after, is_equal,
)


# ---------------------------------------------------------------------------
# Load shared test pairs
# ---------------------------------------------------------------------------

_PAIRS_FILE = Path(__file__).parents[3] / "testdata" / "pairs.json"
PAIRS = json.loads(_PAIRS_FILE.read_text())


def _ad(p: dict) -> tuple[int, int, int]:
    return tuple(p["ad"])  # type: ignore[return-value]


def _bs(p: dict) -> tuple[int, int, int]:
    return tuple(p["bs"])  # type: ignore[return-value]


def _pair_id(p: dict) -> str:
    ay, am, ad = p["ad"]
    by, bm, bd = p["bs"]
    return f"AD{ay}-{am:02d}-{ad:02d}=BS{by}-{bm:02d}-{bd:02d}"


# ---------------------------------------------------------------------------
# Conversion pairs (testdata/pairs.json) — single source of truth
# ---------------------------------------------------------------------------

class TestAdToBsPairs:

    @pytest.mark.parametrize("pair", PAIRS, ids=[_pair_id(p) for p in PAIRS])
    def test_ad_to_bs(self, pair):
        ay, am, ad = pair["ad"]
        by, bm, bd = pair["bs"]
        assert ad_to_bs(ay, am, ad) == (by, bm, bd)


class TestBsToAdPairs:

    @pytest.mark.parametrize("pair", PAIRS, ids=[_pair_id(p) for p in PAIRS])
    def test_bs_to_ad(self, pair):
        ay, am, ad_d = pair["ad"]
        by, bm, bd = pair["bs"]
        assert bs_to_ad(by, bm, bd) == date(ay, am, ad_d)


# ---------------------------------------------------------------------------
# ad_to_bs — range errors
# ---------------------------------------------------------------------------

class TestAdToBsErrors:

    def test_before_min_raises(self):
        with pytest.raises(ValueError, match="before"):
            ad_to_bs(1918, 4, 12)

    def test_well_before_min_raises(self):
        with pytest.raises(ValueError):
            ad_to_bs(1900, 1, 1)

    def test_after_max_raises(self):
        with pytest.raises(ValueError):
            ad_to_bs(2044, 4, 14)

    def test_well_after_max_raises(self):
        with pytest.raises(ValueError):
            ad_to_bs(2100, 1, 1)

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_y,bs_m,bs_d", [
        (2005,  4, 13, 2061, 12, 31),  # last  day of BS 2061
        (2005,  4, 14, 2062,  1,  1),  # first day of BS 2062
        (2006,  4, 13, 2062, 12, 31),  # last  day of BS 2062
        (2006,  4, 14, 2063,  1,  1),  # first day of BS 2063
        (2031,  4, 15, 2087, 12, 30),  # last  day of BS 2087 (367 days)
        (2031,  4, 16, 2088,  1,  1),  # first day of BS 2088
    ])
    def test_year_rollovers(self, ad_y, ad_m, ad_d, bs_y, bs_m, bs_d):
        assert ad_to_bs(ad_y, ad_m, ad_d) == (bs_y, bs_m, bs_d)


# ---------------------------------------------------------------------------
# bs_to_ad — validation errors
# ---------------------------------------------------------------------------

class TestBsToAdErrors:

    @pytest.mark.parametrize("y,m,d,match", [
        (1974,  1,  1, "year"),   # year too low
        (2101,  1,  1, "year"),   # year too high
        (2083,  0,  1, "month"),  # month 0
        (2083, 13,  1, "month"),  # month 13
        (2083, -1,  1, "month"),  # negative month
        (2083,  1,  0, "day"),    # day 0
        (2083,  1, -1, "day"),    # negative day
        (2083,  1, 32, "day"),    # day 32 (Baisakh 2083 = 31)
        (2062,  1, 32, "day"),    # day 32 (Baisakh 2062 = 31)
        (2087,  8, 31, "day"),    # day 31 (Mangsir 2087 = 30)
        (2087,  9, 31, "day"),    # day 31 (Poush 2087 = 30)
    ])
    def test_invalid_input_raises(self, y, m, d, match):
        with pytest.raises(ValueError):
            bs_to_ad(y, m, d)

    def test_last_valid_day_of_short_month(self):
        """Day = max days in month should succeed, day = max+1 should fail."""
        assert bs_to_ad(2083, 8, 29) == date(2026, 12, 15)   # Mangsir 2083 = 29 days
        with pytest.raises(ValueError):
            bs_to_ad(2083, 8, 30)


# ---------------------------------------------------------------------------
# days_in_month
# ---------------------------------------------------------------------------

class TestDaysInMonth:

    @pytest.mark.parametrize("month,expected", [
        (1, 31), (2, 31), (3, 32), (4, 31),
        (5, 31), (6, 31), (7, 30), (8, 29),
        (9, 30), (10, 29), (11, 30), (12, 30),
    ])
    def test_bs2083_all_months(self, month, expected):
        assert days_in_month(2083, month) == expected

    def test_bs2062_baisakh_is_31(self):
        """[✓] BS 2062 Baisakh = 31."""
        assert days_in_month(2062, 1) == 31

    def test_bs2062_jestha_is_31(self):
        """[✓] BS 2062 Jestha = 31."""
        assert days_in_month(2062, 2) == 31

    def test_bs2087_mangsir_is_30(self):
        """[✓✓] BS 2087 Mangsir = 30."""
        assert days_in_month(2087, 8) == 30

    def test_bs2087_poush_is_30(self):
        """[✓✓] BS 2087 Poush = 30."""
        assert days_in_month(2087, 9) == 30

    @pytest.mark.parametrize("y,m,expected", [
        (1975,  3, 32),  # Ashadh often has 32 days
        (2000,  1, 30),  # Baisakh 2000 = 30
        (2050,  4, 32),  # Shrawan with 32 days
        (2100, 12, 30),  # last month of last year
    ])
    def test_various_months(self, y, m, expected):
        assert days_in_month(y, m) == expected

    @pytest.mark.parametrize("y,m", [
        (1974, 1), (2101, 1),   # year out of range
        (2083, 0), (2083, 13),  # month out of range
    ])
    def test_out_of_range_raises(self, y, m):
        with pytest.raises(ValueError):
            days_in_month(y, m)


# ---------------------------------------------------------------------------
# is_valid_bs
# ---------------------------------------------------------------------------

class TestIsValidBs:

    @pytest.mark.parametrize("y,m,d", [
        (1975,  1,  1),   # min date
        (2083,  5, 11),   # today
        (2100, 12, 30),   # max date
        (2062,  1, 31),   # Baisakh 2062 last day (31, not 30)
        (2087,  8, 30),   # Mangsir 2087 last day (30, not 29)
        (2087,  9, 30),   # Poush 2087 last day (30, not 29)
        (2083,  3, 32),   # Ashadh 2083 = 32 days
    ])
    def test_valid_dates(self, y, m, d):
        assert is_valid_bs(y, m, d) is True

    @pytest.mark.parametrize("y,m,d", [
        (1974,  1,  1),   # year too low
        (2101,  1,  1),   # year too high
        (2083,  0,  1),   # month 0
        (2083, 13,  1),   # month 13
        (2083,  1,  0),   # day 0
        (2083,  1, 32),   # day > max (Baisakh 2083 = 31)
        (2062,  1, 32),   # day > max (Baisakh 2062 = 31)
        (2087,  8, 31),   # day > max (Mangsir 2087 = 30)
        (2083,  3, 33),   # day > max (Ashadh 2083 = 32)
    ])
    def test_invalid_dates(self, y, m, d):
        assert is_valid_bs(y, m, d) is False


# ---------------------------------------------------------------------------
# format_bs / parse_bs
# ---------------------------------------------------------------------------

class TestFormatBs:

    def test_zero_pads_month_and_day(self):
        assert format_bs(2083, 5, 11) == "2083-05-11"

    def test_single_digit_parts(self):
        assert format_bs(1975, 1, 1) == "1975-01-01"

    def test_round_trips_with_parse_bs(self):
        assert parse_bs(format_bs(2083, 5, 11)) == (2083, 5, 11)


# ---------------------------------------------------------------------------
# compare_bs / is_before / is_after / is_equal
# ---------------------------------------------------------------------------

class TestCompareBs:

    A = (2083, 5, 10)
    B = (2083, 5, 11)
    C = (2083, 5, 11)

    def test_compare_less(self):    assert compare_bs(self.A, self.B) == -1
    def test_compare_greater(self): assert compare_bs(self.B, self.A) == 1
    def test_compare_equal(self):   assert compare_bs(self.B, self.C) == 0

    def test_is_before_true(self):  assert is_before(self.A, self.B) is True
    def test_is_before_false(self): assert is_before(self.B, self.A) is False
    def test_is_before_equal(self): assert is_before(self.B, self.C) is False

    def test_is_after_true(self):   assert is_after(self.B, self.A) is True
    def test_is_after_false(self):  assert is_after(self.A, self.B) is False
    def test_is_after_equal(self):  assert is_after(self.B, self.C) is False

    def test_is_equal_true(self):   assert is_equal(self.B, self.C) is True
    def test_is_equal_false(self):  assert is_equal(self.A, self.B) is False

    def test_usable_as_sort_key(self):
        import functools
        dates = [self.B, self.A, self.C]
        assert sorted(dates, key=functools.cmp_to_key(compare_bs)) == [self.A, self.B, self.C]


# ---------------------------------------------------------------------------
# Round-trip tests
# ---------------------------------------------------------------------------

class TestRoundTrip:

    @pytest.mark.parametrize("y,m,d", [
        (1975,  1,  1),   # min
        (1975, 12, 30),   # end of first year
        (2000,  1,  1),   # year 2000
        (2000,  6, 15),   # mid year
        (2062,  1,  1),   # Baisakh 2062 start
        (2062,  1, 31),   # Baisakh 2062 last (corrected)
        (2062,  2, 31),   # Jestha 2062 last (corrected)
        (2083,  5, 11),   # today
        (2083,  3, 32),   # 32-day month last day
        (2083,  8, 29),   # 29-day month last day
        (2087,  1,  1),   # first day of corrected year
        (2087,  8, 30),   # Mangsir last (corrected)
        (2087,  9, 30),   # Poush last (corrected)
        (2087, 12, 30),   # last day of BS 2087
        (2100, 12, 30),   # max
    ])
    def test_bs_roundtrip(self, y, m, d):
        """bs_to_ad → ad_to_bs must return the original BS date."""
        ad_date = bs_to_ad(y, m, d)
        assert ad_to_bs(ad_date.year, ad_date.month, ad_date.day) == (y, m, d)

    @pytest.mark.parametrize("y,m,d", [
        (1918,  4, 13),   # reference anchor
        (1940,  1,  1),
        (1960,  6, 15),
        (2000,  1,  1),
        (2005,  5, 14),   # BS 2062 Baisakh last
        (2005,  6, 14),   # BS 2062 Jestha last
        (2026,  8, 27),   # today
        (2030, 12, 16),   # BS 2087 Mangsir last
        (2031,  1, 15),   # BS 2087 Poush last
        (2031,  4, 16),   # BS 2088 start
        (2044,  4, 13),   # max AD date
    ])
    def test_ad_roundtrip(self, y, m, d):
        """ad_to_bs → bs_to_ad must return the original AD date."""
        bs = ad_to_bs(y, m, d)
        assert bs_to_ad(bs[0], bs[1], bs[2]) == date(y, m, d)


# ---------------------------------------------------------------------------
# Calendar data integrity
# ---------------------------------------------------------------------------

class TestCalendarIntegrity:

    def test_all_years_present(self):
        """Calendar must cover every year from MIN to MAX with no gaps."""
        for y in range(MIN_BS_YEAR, MAX_BS_YEAR + 1):
            assert y in CALENDAR, f"BS year {y} missing from CALENDAR"

    def test_all_years_have_12_months(self):
        for y in range(MIN_BS_YEAR, MAX_BS_YEAR + 1):
            assert len(CALENDAR[y]) == 12, f"BS {y} does not have 12 months"

    def test_all_month_values_in_valid_range(self):
        """Every month must have 29–32 days (BS months are always in this range)."""
        for y, months in CALENDAR.items():
            for m_idx, days in enumerate(months):
                assert 29 <= days <= 32, (
                    f"BS {y} month {m_idx + 1} has {days} days (expected 29–32)"
                )

    def test_year_totals_in_valid_range(self):
        """Every BS year should have 364–367 days.
        BS 2096 = 364 days is a known data point from the source calendar.
        All other years should be 365–367.
        """
        known_short = {2096: 364}
        for y, months in CALENDAR.items():
            total = sum(months)
            if y in known_short:
                assert total == known_short[y], f"BS {y} expected {known_short[y]} days, got {total}"
            else:
                assert 365 <= total <= 367, f"BS {y} has {total} days (expected 365–367)"

    def test_bs2087_is_367_days(self):
        """[✓✓] BS 2087 must have 367 days total."""
        assert sum(CALENDAR[2087]) == 367

    def test_bs2087_mangsir_is_30(self):
        """[✓✓] BS 2087 month 8 (Mangsir) = 30 days."""
        assert CALENDAR[2087][7] == 30

    def test_bs2087_poush_is_30(self):
        """[✓✓] BS 2087 month 9 (Poush) = 30 days."""
        assert CALENDAR[2087][8] == 30

    def test_bs2062_baisakh_is_31(self):
        """[✓] BS 2062 month 1 (Baisakh) = 31 days."""
        assert CALENDAR[2062][0] == 31

    def test_bs2062_jestha_is_31(self):
        """[✓] BS 2062 month 2 (Jestha) = 31 days."""
        assert CALENDAR[2062][1] == 31

    def test_min_year(self):
        assert MIN_BS_YEAR == 1975

    def test_max_year(self):
        assert MAX_BS_YEAR == 2100
