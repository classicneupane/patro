from datetime import date, timedelta
from patro._calendar import CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR, REFERENCE_AD


def days_in_month(year: int, month: int) -> int:
    """Return the number of days in a given BS year and month."""
    if year < MIN_BS_YEAR or year > MAX_BS_YEAR:
        raise ValueError(
            f"BS year {year} is out of supported range [{MIN_BS_YEAR}, {MAX_BS_YEAR}]"
        )
    if month < 1 or month > 12:
        raise ValueError(f"Month {month} is out of range [1, 12]")
    return CALENDAR[year][month - 1]


def is_valid_bs(year: int, month: int, day: int) -> bool:
    """Return True if the given BS date is valid."""
    if year < MIN_BS_YEAR or year > MAX_BS_YEAR:
        return False
    if month < 1 or month > 12:
        return False
    if day < 1 or day > days_in_month(year, month):
        return False
    return True


def ad_to_bs(year: int, month: int, day: int) -> tuple[int, int, int]:
    """
    Convert a Gregorian (AD) date to Bikram Sambat (BS).

    Returns a tuple (bs_year, bs_month, bs_day).
    Raises ValueError if the date is out of the supported range.
    """
    ad_date = date(year, month, day)
    delta = (ad_date - REFERENCE_AD).days

    if delta < 0:
        raise ValueError(
            f"AD date {year}-{month:02d}-{day:02d} is before the minimum supported date "
            f"(AD 1918-04-13 = BS 1975-01-01)"
        )

    # Walk through BS years to find which year the delta falls in
    bs_year = MIN_BS_YEAR
    for y in range(MIN_BS_YEAR, MAX_BS_YEAR + 1):
        year_days = sum(CALENDAR[y])
        if delta < year_days:
            bs_year = y
            break
        delta -= year_days
    else:
        raise ValueError(
            f"AD date {year}-{month:02d}-{day:02d} is after the maximum supported date (BS 2100-12-30)"
        )

    # Walk through months in the found BS year
    bs_month = 1
    for m_idx, m_days in enumerate(CALENDAR[bs_year]):
        if delta < m_days:
            bs_month = m_idx + 1
            break
        delta -= m_days

    bs_day = delta + 1
    return (bs_year, bs_month, bs_day)


def bs_to_ad(year: int, month: int, day: int) -> date:
    """
    Convert a Bikram Sambat (BS) date to Gregorian (AD).

    Returns a datetime.date object.
    Raises ValueError if the BS date is invalid or out of range.
    """
    if year < MIN_BS_YEAR or year > MAX_BS_YEAR:
        raise ValueError(
            f"BS year {year} is out of supported range [{MIN_BS_YEAR}, {MAX_BS_YEAR}]"
        )
    if month < 1 or month > 12:
        raise ValueError(f"Month {month} is out of range [1, 12]")
    max_day = days_in_month(year, month)
    if day < 1 or day > max_day:
        raise ValueError(
            f"Day {day} is out of range [1, {max_day}] for BS {year}/{month}"
        )

    # Count total days from BS 1975-01-01 to the given BS date
    total_days = 0

    # Sum all complete years before this one
    for y in range(MIN_BS_YEAR, year):
        total_days += sum(CALENDAR[y])

    # Sum complete months in the current year
    for m_idx in range(month - 1):
        total_days += CALENDAR[year][m_idx]

    # Add days in the current month (day 1 = 0 extra days)
    total_days += day - 1

    return REFERENCE_AD + timedelta(days=total_days)
