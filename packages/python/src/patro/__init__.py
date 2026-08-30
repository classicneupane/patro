"""
patro — Nepali Bikram Sambat ↔ Gregorian date converter.

Public API:
    ad_to_bs(year, month, day) -> (bs_year, bs_month, bs_day)
    bs_to_ad(year, month, day) -> datetime.date
    days_in_month(year, month) -> int
    is_valid_bs(year, month, day) -> bool

    to_nepali_digits(n) -> str
    today_bs() -> (bs_year, bs_month, bs_day)
    next_bs_month(year, month) -> (year, month)
    prev_bs_month(year, month) -> (year, month)
    parse_bs(date_str) -> (bs_year, bs_month, bs_day)
    bs_date_to_string(year, month, day) -> str
    parse_ad(date_str) -> datetime.date
    day_of_week_bs(year, month, day) -> int  (0=Sunday)
    days_in_year(year) -> int
    compare_bs(a, b) -> int  (-1 | 0 | 1)
"""

from patro._converter import ad_to_bs, bs_to_ad, days_in_month, is_valid_bs
from patro._calendar import (
    CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR, REFERENCE_AD,
    MONTH_NAMES, MONTH_NAMES_EN, MONTH_NAMES_NP,
    DAY_NAMES_EN, DAY_NAMES_EN_SHORT,
    DAY_NAMES_NP, DAY_NAMES_NP_SHORT,
)
from patro._utils import (
    to_nepali_digits,
    today_bs,
    next_bs_month, prev_bs_month,
    parse_bs, bs_date_to_string,
    parse_ad,
    day_of_week_bs,
    days_in_year,
    compare_bs,
)

__all__ = [
    "ad_to_bs", "bs_to_ad", "days_in_month", "is_valid_bs",
    "CALENDAR", "MIN_BS_YEAR", "MAX_BS_YEAR", "REFERENCE_AD",
    "MONTH_NAMES", "MONTH_NAMES_EN", "MONTH_NAMES_NP",
    "DAY_NAMES_EN", "DAY_NAMES_EN_SHORT",
    "DAY_NAMES_NP", "DAY_NAMES_NP_SHORT",
    "to_nepali_digits",
    "today_bs",
    "next_bs_month", "prev_bs_month",
    "parse_bs", "bs_date_to_string",
    "parse_ad",
    "day_of_week_bs",
    "days_in_year",
    "compare_bs",
]
