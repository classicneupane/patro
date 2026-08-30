"""
Comprehensive tests for the patro Nepali BS <-> AD date converter.

All test-case data is loaded from testdata/cases.json at the monorepo root —
a single source of truth shared with the TypeScript test suite.
To add new test cases, edit testdata/cases.json only.

Test pairs marked [✓] or [✓✓] were cross-verified against external reference implementations.
"""

import json
import functools
import pytest
from datetime import date
from pathlib import Path

from patro import (
    ad_to_bs, bs_to_ad, days_in_month, is_valid_bs,
    CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR,
    format_bs, parse_bs, compare_bs, is_before, is_after, is_equal,
)


# ---------------------------------------------------------------------------
# Load shared test cases
# ---------------------------------------------------------------------------

_CASES_FILE = Path(__file__).parents[3] / "testdata" / "cases.json"
CASES = json.loads(_CASES_FILE.read_text())

PAIRS = CASES["conversion_pairs"]
AD_OUT_OF_RANGE = CASES["ad_to_bs_out_of_range"]
BS_INVALID = CASES["bs_to_ad_invalid"]
DAYS_IN_MONTH_CASES = CASES["days_in_month"]
DAYS_IN_MONTH_OOR = CASES["days_in_month_out_of_range"]
VALID_BS = CASES["valid_bs_dates"]
INVALID_BS = CASES["invalid_bs_dates"]
ROUND_TRIP_BS = CASES["round_trip_bs"]
ROUND_TRIP_AD = CASES["round_trip_ad"]


def _pair_id(p: dict) -> str:
    ay, am, ad = p["ad"]
    by, bm, bd = p["bs"]
    return f"AD{ay}-{am:02d}-{ad:02d}=BS{by}-{bm:02d}-{bd:02d}"


# ---------------------------------------------------------------------------
# Conversion pairs — single source of truth
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
# ad_to_bs — out-of-range errors
# ---------------------------------------------------------------------------

class TestAdToBsOutOfRange:

    @pytest.mark.parametrize(
        "y,m,d,note",
        [(p["ad"][0], p["ad"][1], p["ad"][2], p.get("note", "")) for p in AD_OUT_OF_RANGE],
        ids=[f"AD{p['ad'][0]}-{p['ad'][1]:02d}-{p['ad'][2]:02d}" for p in AD_OUT_OF_RANGE],
    )
    def test_out_of_range_raises(self, y, m, d, note):
        with pytest.raises(ValueError):
            ad_to_bs(y, m, d)


# ---------------------------------------------------------------------------
# bs_to_ad — invalid input errors
# ---------------------------------------------------------------------------

class TestBsToAdInvalid:

    @pytest.mark.parametrize(
        "y,m,d,reason",
        [(p["bs"][0], p["bs"][1], p["bs"][2], p["reason"]) for p in BS_INVALID],
        ids=[f"BS{p['bs'][0]}-{p['bs'][1]}-{p['bs'][2]}" for p in BS_INVALID],
    )
    def test_invalid_input_raises(self, y, m, d, reason):
        with pytest.raises(ValueError):
            bs_to_ad(y, m, d)


# ---------------------------------------------------------------------------
# days_in_month
# ---------------------------------------------------------------------------

class TestDaysInMonth:

    @pytest.mark.parametrize(
        "year,month,expected,note",
        [(c["year"], c["month"], c["expected"], c.get("note", "")) for c in DAYS_IN_MONTH_CASES],
        ids=[f"BS{c['year']}-m{c['month']:02d}" for c in DAYS_IN_MONTH_CASES],
    )
    def test_valid(self, year, month, expected, note):
        assert days_in_month(year, month) == expected

    @pytest.mark.parametrize(
        "year,month,reason",
        [(c["year"], c["month"], c["reason"]) for c in DAYS_IN_MONTH_OOR],
        ids=[f"BS{c['year']}-m{c['month']}" for c in DAYS_IN_MONTH_OOR],
    )
    def test_out_of_range_raises(self, year, month, reason):
        with pytest.raises(ValueError):
            days_in_month(year, month)


# ---------------------------------------------------------------------------
# is_valid_bs
# ---------------------------------------------------------------------------

class TestIsValidBs:

    @pytest.mark.parametrize(
        "y,m,d,note",
        [(c["bs"][0], c["bs"][1], c["bs"][2], c.get("note", "")) for c in VALID_BS],
        ids=[f"BS{c['bs'][0]}-{c['bs'][1]:02d}-{c['bs'][2]:02d}" for c in VALID_BS],
    )
    def test_valid_dates(self, y, m, d, note):
        assert is_valid_bs(y, m, d) is True

    @pytest.mark.parametrize(
        "y,m,d,reason",
        [(c["bs"][0], c["bs"][1], c["bs"][2], c["reason"]) for c in INVALID_BS],
        ids=[f"BS{c['bs'][0]}-{c['bs'][1]}-{c['bs'][2]}" for c in INVALID_BS],
    )
    def test_invalid_dates(self, y, m, d, reason):
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
        dates = [self.B, self.A, self.C]
        assert sorted(dates, key=functools.cmp_to_key(compare_bs)) == [self.A, self.B, self.C]


# ---------------------------------------------------------------------------
# Round-trip tests
# ---------------------------------------------------------------------------

class TestRoundTrip:

    @pytest.mark.parametrize(
        "y,m,d,note",
        [(c["bs"][0], c["bs"][1], c["bs"][2], c.get("note", "")) for c in ROUND_TRIP_BS],
        ids=[f"BS{c['bs'][0]}-{c['bs'][1]:02d}-{c['bs'][2]:02d}" for c in ROUND_TRIP_BS],
    )
    def test_bs_roundtrip(self, y, m, d, note):
        """bs_to_ad → ad_to_bs must return the original BS date."""
        ad_date = bs_to_ad(y, m, d)
        assert ad_to_bs(ad_date.year, ad_date.month, ad_date.day) == (y, m, d)

    @pytest.mark.parametrize(
        "y,m,d,note",
        [(c["ad"][0], c["ad"][1], c["ad"][2], c.get("note", "")) for c in ROUND_TRIP_AD],
        ids=[f"AD{c['ad'][0]}-{c['ad'][1]:02d}-{c['ad'][2]:02d}" for c in ROUND_TRIP_AD],
    )
    def test_ad_roundtrip(self, y, m, d, note):
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
