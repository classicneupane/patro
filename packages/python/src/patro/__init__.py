"""
patro — Nepali Bikram Sambat ↔ Gregorian date converter.

Public API:
    ad_to_bs(year, month, day) -> (bs_year, bs_month, bs_day)
    bs_to_ad(year, month, day) -> datetime.date
    days_in_month(year, month) -> int
    is_valid_bs(year, month, day) -> bool
"""

from patro._converter import ad_to_bs, bs_to_ad, days_in_month, is_valid_bs
from patro._calendar import CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR, REFERENCE_AD, MONTH_NAMES

__all__ = [
    "ad_to_bs",
    "bs_to_ad",
    "days_in_month",
    "is_valid_bs",
    "CALENDAR",
    "MIN_BS_YEAR",
    "MAX_BS_YEAR",
    "REFERENCE_AD",
    "MONTH_NAMES",
]
