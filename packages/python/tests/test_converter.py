"""
Comprehensive tests for the patro Nepali BS <-> AD date converter.

All AD<->BS pairs marked with [H] are verified against Hamropatro (gold standard).
All pairs marked with [A] are verified against prabinghimire1 API.
Unmarked pairs are derived from the verified reference anchor via the algorithm.
"""

import pytest
from datetime import date

from patro import ad_to_bs, bs_to_ad, days_in_month, is_valid_bs, CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ad(y: int, m: int, d: int) -> date:
    return date(y, m, d)


# ---------------------------------------------------------------------------
# ad_to_bs
# ---------------------------------------------------------------------------

class TestAdToBs:

    # ── Reference & known spot checks ───────────────────────────────────────

    def test_reference_anchor(self):
        """[H] AD 1918-04-13 = BS 1975-01-01 — the conversion anchor."""
        assert ad_to_bs(1918, 4, 13) == (1975, 1, 1)

    def test_today(self):
        """[H] AD 2026-08-27 = BS 2083-05-11."""
        assert ad_to_bs(2026, 8, 27) == (2083, 5, 11)

    # ── Year boundaries (first & last day) — spread across full range ────────

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_y,bs_m,bs_d", [
        (1918,  4, 13, 1975,  1,  1),   # first day of BS 1975
        (1919,  4, 12, 1975, 12, 30),   # last  day of BS 1975
        (1923,  4, 13, 1980,  1,  1),
        (1924,  4, 12, 1980, 12, 31),
        (1933,  4, 13, 1990,  1,  1),
        (1934,  4, 12, 1990, 12, 30),
        (1943,  4, 14, 2000,  1,  1),
        (1944,  4, 12, 2000, 12, 31),
        (1953,  4, 13, 2010,  1,  1),
        (1954,  4, 12, 2010, 12, 30),
        (1963,  4, 14, 2020,  1,  1),
        (1964,  4, 12, 2020, 12, 30),
        (1973,  4, 13, 2030,  1,  1),
        (1974,  4, 13, 2030, 12, 31),
        (1983,  4, 14, 2040,  1,  1),
        (1984,  4, 12, 2040, 12, 30),
        (1993,  4, 13, 2050,  1,  1),
        (1994,  4, 13, 2050, 12, 31),
        (2003,  4, 14, 2060,  1,  1),
        (2004,  4, 12, 2060, 12, 30),
        (2013,  4, 14, 2070,  1,  1),
        (2014,  4, 13, 2070, 12, 30),
        (2023,  4, 14, 2080,  1,  1),
        (2024,  4, 12, 2080, 12, 30),
        (2026,  4, 14, 2083,  1,  1),
        (2027,  4, 13, 2083, 12, 30),
        (2033,  4, 15, 2090,  1,  1),
        (2034,  4, 14, 2090, 12, 30),
        (2043,  4, 15, 2100,  1,  1),
        (2044,  4, 13, 2100, 12, 30),  # last supported date
    ])
    def test_year_boundaries(self, ad_y, ad_m, ad_d, bs_y, bs_m, bs_d):
        assert ad_to_bs(ad_y, ad_m, ad_d) == (bs_y, bs_m, bs_d)

    # ── BS 2083 — all 12 months (current year, Hamropatro verified) [H] ──────

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_m,bs_d", [
        (2026,  4, 14,  1,  1),   # Baisakh 1
        (2026,  5, 14,  1, 31),   # Baisakh 31 (last)
        (2026,  5, 15,  2,  1),   # Jestha 1
        (2026,  6, 14,  2, 31),   # Jestha 31 (last)
        (2026,  6, 15,  3,  1),   # Ashadh 1
        (2026,  7, 16,  3, 32),   # Ashadh 32 (last — 32-day month)
        (2026,  7, 17,  4,  1),   # Shrawan 1
        (2026,  8, 16,  4, 31),   # Shrawan 31 (last)
        (2026,  8, 17,  5,  1),   # Bhadra 1
        (2026,  9, 16,  5, 31),   # Bhadra 31 (last)
        (2026,  9, 17,  6,  1),   # Ashwin 1
        (2026, 10, 17,  6, 31),   # Ashwin 31 (last)
        (2026, 10, 18,  7,  1),   # Kartik 1
        (2026, 11, 16,  7, 30),   # Kartik 30 (last)
        (2026, 11, 17,  8,  1),   # Mangsir 1
        (2026, 12, 15,  8, 29),   # Mangsir 29 (last — 29-day month)
        (2026, 12, 16,  9,  1),   # Poush 1
        (2027,  1, 14,  9, 30),   # Poush 30 (last)
        (2027,  1, 15, 10,  1),   # Magh 1
        (2027,  2, 12, 10, 29),   # Magh 29 (last — 29-day month)
        (2027,  2, 13, 11,  1),   # Falgun 1
        (2027,  3, 14, 11, 30),   # Falgun 30 (last)
        (2027,  3, 15, 12,  1),   # Chaitra 1
        (2027,  4, 13, 12, 30),   # Chaitra 30 (last)
    ])
    def test_bs2083_all_months(self, ad_y, ad_m, ad_d, bs_m, bs_d):
        assert ad_to_bs(ad_y, ad_m, ad_d) == (2083, bs_m, bs_d)

    # ── BS 2062 — all 12 months (JS lib had Baisakh=30, Jestha=32 — wrong) ──

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_m,bs_d", [
        (2005,  4, 14,  1,  1),   # Baisakh 1
        (2005,  5, 13,  1, 30),   # Baisakh 30
        (2005,  5, 14,  1, 31),   # Baisakh 31 (last — 31 days, NOT 30) [H]
        (2005,  5, 15,  2,  1),   # Jestha 1 [H]
        (2005,  6, 14,  2, 31),   # Jestha 31 (last — 31 days, NOT 32) [H]
        (2005,  6, 15,  3,  1),   # Ashadh 1 [H]
        (2005,  7, 15,  3, 31),   # Ashadh 31 (last)
        (2005,  7, 16,  4,  1),   # Shrawan 1
        (2005,  8, 16,  4, 32),   # Shrawan 32 (last — 32-day month)
        (2005,  8, 17,  5,  1),   # Bhadra 1
        (2005,  9, 16,  5, 31),   # Bhadra 31 (last)
        (2005,  9, 17,  6,  1),   # Ashwin 1
        (2005, 10, 17,  6, 31),   # Ashwin 31 (last)
        (2005, 10, 18,  7,  1),   # Kartik 1
        (2005, 11, 15,  7, 29),   # Kartik 29 (last)
        (2005, 11, 16,  8,  1),   # Mangsir 1
        (2005, 12, 15,  8, 30),   # Mangsir 30 (last)
        (2005, 12, 16,  9,  1),   # Poush 1
        (2006,  1, 13,  9, 29),   # Poush 29 (last)
        (2006,  1, 14, 10,  1),   # Magh 1
        (2006,  2, 12, 10, 30),   # Magh 30 (last)
        (2006,  2, 13, 11,  1),   # Falgun 1
        (2006,  3, 13, 11, 29),   # Falgun 29 (last)
        (2006,  3, 14, 12,  1),   # Chaitra 1
        (2006,  4, 13, 12, 31),   # Chaitra 31 (last)
    ])
    def test_bs2062_all_months(self, ad_y, ad_m, ad_d, bs_m, bs_d):
        assert ad_to_bs(ad_y, ad_m, ad_d) == (2062, bs_m, bs_d)

    # ── BS 2087 — all 12 months (both libs had wrong month lengths) ──────────

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_m,bs_d", [
        (2030,  4, 14,  1,  1),   # Baisakh 1
        (2030,  5, 14,  1, 31),   # Baisakh 31 (last)
        (2030,  5, 15,  2,  1),   # Jestha 1
        (2030,  6, 14,  2, 31),   # Jestha 31 (last)
        (2030,  6, 15,  3,  1),   # Ashadh 1
        (2030,  7, 16,  3, 32),   # Ashadh 32 (last)
        (2030,  7, 17,  4,  1),   # Shrawan 1
        (2030,  8, 16,  4, 31),   # Shrawan 31 (last)
        (2030,  8, 17,  5,  1),   # Bhadra 1
        (2030,  9, 16,  5, 31),   # Bhadra 31 (last)
        (2030,  9, 17,  6,  1),   # Ashwin 1
        (2030, 10, 17,  6, 31),   # Ashwin 31 (last)
        (2030, 10, 18,  7,  1),   # Kartik 1
        (2030, 11, 16,  7, 30),   # Kartik 30 (last)
        (2030, 11, 17,  8,  1),   # Mangsir 1
        (2030, 12, 15,  8, 29),   # Mangsir 29 [H]
        (2030, 12, 16,  8, 30),   # Mangsir 30 (last — 30 days, NOT 29) [H][A]
        (2030, 12, 17,  9,  1),   # Poush 1 [H]
        (2031,  1, 14,  9, 29),   # Poush 29 [H]
        (2031,  1, 15,  9, 30),   # Poush 30 (last — 30 days, NOT 29) [H][A]
        (2031,  1, 16, 10,  1),   # Magh 1 [H]
        (2031,  2, 14, 10, 30),   # Magh 30 (last)
        (2031,  2, 15, 11,  1),   # Falgun 1
        (2031,  3, 16, 11, 30),   # Falgun 30 (last)
        (2031,  3, 17, 12,  1),   # Chaitra 1
        (2031,  4, 15, 12, 30),   # Chaitra 30 (last)
        (2031,  4, 16,  1,  1),   # BS 2088 Baisakh 1 — confirms 2087=367 days [A]
    ])
    def test_bs2087_all_months(self, ad_y, ad_m, ad_d, bs_m, bs_d):
        year = 2087 if bs_m <= 12 and not (bs_m == 1 and bs_d == 1 and ad_y == 2031) else 2088
        expected_year = 2088 if (ad_y, ad_m, ad_d) == (2031, 4, 16) else 2087
        assert ad_to_bs(ad_y, ad_m, ad_d) == (expected_year, bs_m, bs_d)

    # ── Adjacent year boundaries (ensure correct year rollover) ─────────────

    @pytest.mark.parametrize("ad_y,ad_m,ad_d,bs_y,bs_m,bs_d", [
        (2005,  4, 13, 2061, 12, 31),  # last  day of BS 2061
        (2005,  4, 14, 2062,  1,  1),  # first day of BS 2062
        (2006,  4, 13, 2062, 12, 31),  # last  day of BS 2062
        (2006,  4, 14, 2063,  1,  1),  # first day of BS 2063
        (2029,  4, 13, 2085, 12, 30),  # last  day of BS 2085 (Chaitra=30)
        (2030,  4, 14, 2087,  1,  1),  # first day of BS 2087
        (2031,  4, 15, 2087, 12, 30),  # last  day of BS 2087 (367 days)
        (2031,  4, 16, 2088,  1,  1),  # first day of BS 2088
    ])
    def test_year_rollovers(self, ad_y, ad_m, ad_d, bs_y, bs_m, bs_d):
        assert ad_to_bs(ad_y, ad_m, ad_d) == (bs_y, bs_m, bs_d)

    # ── Range errors ─────────────────────────────────────────────────────────

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

    def test_max_valid_date(self):
        """AD 2044-04-13 = BS 2100-12-30 — the last supported date."""
        assert ad_to_bs(2044, 4, 13) == (2100, 12, 30)

    def test_min_valid_date(self):
        """AD 1918-04-13 = BS 1975-01-01 — the first supported date."""
        assert ad_to_bs(1918, 4, 13) == (1975, 1, 1)


# ---------------------------------------------------------------------------
# bs_to_ad
# ---------------------------------------------------------------------------

class TestBsToAd:

    # ── Reference & known spot checks ───────────────────────────────────────

    def test_reference_anchor(self):
        """[H] BS 1975-01-01 = AD 1918-04-13."""
        assert bs_to_ad(1975, 1, 1) == ad(1918, 4, 13)

    def test_today(self):
        """[H] BS 2083-05-11 = AD 2026-08-27."""
        assert bs_to_ad(2083, 5, 11) == ad(2026, 8, 27)

    # ── Hamropatro-verified key dates ────────────────────────────────────────

    def test_bs2062_baisakh_last(self):
        """[H] BS 2062-01-31 = AD 2005-05-14 (Baisakh=31 days)."""
        assert bs_to_ad(2062, 1, 31) == ad(2005, 5, 14)

    def test_bs2062_jestha_first(self):
        """[H] BS 2062-02-01 = AD 2005-05-15."""
        assert bs_to_ad(2062, 2, 1) == ad(2005, 5, 15)

    def test_bs2062_jestha_last(self):
        """[H] BS 2062-02-31 = AD 2005-06-14 (Jestha=31 days)."""
        assert bs_to_ad(2062, 2, 31) == ad(2005, 6, 14)

    def test_bs2087_mangsir_last(self):
        """[H][A] BS 2087-08-30 = AD 2030-12-16 (Mangsir=30 days)."""
        assert bs_to_ad(2087, 8, 30) == ad(2030, 12, 16)

    def test_bs2087_poush_first(self):
        """[H] BS 2087-09-01 = AD 2030-12-17."""
        assert bs_to_ad(2087, 9, 1) == ad(2030, 12, 17)

    def test_bs2087_poush_last(self):
        """[H][A] BS 2087-09-30 = AD 2031-01-15 (Poush=30 days)."""
        assert bs_to_ad(2087, 9, 30) == ad(2031, 1, 15)

    def test_bs2087_magh_first(self):
        """[H] BS 2087-10-01 = AD 2031-01-16."""
        assert bs_to_ad(2087, 10, 1) == ad(2031, 1, 16)

    def test_bs2088_baisakh_first(self):
        """[A] BS 2088-01-01 = AD 2031-04-16 (confirms BS 2087 = 367 days)."""
        assert bs_to_ad(2088, 1, 1) == ad(2031, 4, 16)

    # ── Range boundaries ─────────────────────────────────────────────────────

    def test_min_date(self):
        """BS 1975-01-01 = AD 1918-04-13 (minimum)."""
        assert bs_to_ad(1975, 1, 1) == ad(1918, 4, 13)

    def test_max_date(self):
        """BS 2100-12-30 = AD 2044-04-13 (maximum)."""
        assert bs_to_ad(2100, 12, 30) == ad(2044, 4, 13)

    # ── Validation errors ────────────────────────────────────────────────────

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
        assert bs_to_ad(2083, 8, 29) == ad(2026, 12, 15)   # Mangsir 2083 = 29 days
        with pytest.raises(ValueError):
            bs_to_ad(2083, 8, 30)


# ---------------------------------------------------------------------------
# days_in_month
# ---------------------------------------------------------------------------

class TestDaysInMonth:

    # ── All 12 months for BS 2083 ────────────────────────────────────────────

    @pytest.mark.parametrize("month,expected", [
        (1, 31), (2, 31), (3, 32), (4, 31),
        (5, 31), (6, 31), (7, 30), (8, 29),
        (9, 30), (10, 29), (11, 30), (12, 30),
    ])
    def test_bs2083_all_months(self, month, expected):
        assert days_in_month(2083, month) == expected

    # ── Known corrected months ───────────────────────────────────────────────

    def test_bs2062_baisakh_is_31(self):
        """[H] BS 2062 Baisakh = 31 (JS lib had 30)."""
        assert days_in_month(2062, 1) == 31

    def test_bs2062_jestha_is_31(self):
        """[H] BS 2062 Jestha = 31 (JS lib had 32)."""
        assert days_in_month(2062, 2) == 31

    def test_bs2087_mangsir_is_30(self):
        """[H][A] BS 2087 Mangsir = 30 (Python lib had 29)."""
        assert days_in_month(2087, 8) == 30

    def test_bs2087_poush_is_30(self):
        """[H][A] BS 2087 Poush = 30 (JS lib had 29)."""
        assert days_in_month(2087, 9) == 30

    # ── Typical month lengths across years ───────────────────────────────────

    @pytest.mark.parametrize("y,m,expected", [
        (1975,  3, 32),  # Ashadh often has 32 days
        (2000,  1, 30),  # Baisakh 2000 = 30
        (2050,  4, 32),  # Shrawan with 32 days
        (2100, 12, 30),  # last month of last year
    ])
    def test_various_months(self, y, m, expected):
        assert days_in_month(y, m) == expected

    # ── Errors ───────────────────────────────────────────────────────────────

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
        """[H][A] BS 2087 must have 367 days total (corrected from 366)."""
        assert sum(CALENDAR[2087]) == 367

    def test_bs2087_mangsir_is_30(self):
        """[H][A] BS 2087 month 8 (Mangsir) = 30 days."""
        assert CALENDAR[2087][7] == 30

    def test_bs2087_poush_is_30(self):
        """[H][A] BS 2087 month 9 (Poush) = 30 days."""
        assert CALENDAR[2087][8] == 30

    def test_bs2062_baisakh_is_31(self):
        """[H] BS 2062 month 1 (Baisakh) = 31 days (not 30)."""
        assert CALENDAR[2062][0] == 31

    def test_bs2062_jestha_is_31(self):
        """[H] BS 2062 month 2 (Jestha) = 31 days (not 32)."""
        assert CALENDAR[2062][1] == 31

    def test_min_year(self):
        assert MIN_BS_YEAR == 1975

    def test_max_year(self):
        assert MAX_BS_YEAR == 2100
