from datetime import date
from patro._calendar import CALENDAR, MIN_BS_YEAR, MAX_BS_YEAR
from patro._converter import ad_to_bs, bs_to_ad, days_in_month

_NP_DIGITS = '०१२३४५६७८९'


def to_nepali_digits(n: int | str) -> str:
    """Convert ASCII digits in a number or string to Nepali Devanagari digits."""
    return ''.join(_NP_DIGITS[int(c)] if c.isdigit() else c for c in str(n))


def today_bs() -> tuple[int, int, int]:
    """Return today's date in BS using local system time."""
    today = date.today()
    return ad_to_bs(today.year, today.month, today.day)


def next_bs_month(year: int, month: int) -> tuple[int, int]:
    """Return the next BS month, rolling over to the next year at month 12."""
    if month == 12:
        return (year + 1, 1)
    return (year, month + 1)


def prev_bs_month(year: int, month: int) -> tuple[int, int]:
    """Return the previous BS month, rolling back to the previous year at month 1."""
    if month == 1:
        return (year - 1, 12)
    return (year, month - 1)


def parse_bs(date_str: str) -> tuple[int, int, int]:
    """
    Parse a BS date string in YYYY-MM-DD format.
    Raises ValueError if malformed or out of range.
    """
    parts = date_str.strip().split('-')
    if len(parts) != 3 or any(p == '' for p in parts):
        raise ValueError(f"BS date must be in YYYY-MM-DD format, got: \"{date_str}\"")
    try:
        y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
    except ValueError:
        raise ValueError(f"BS date must be in YYYY-MM-DD format, got: \"{date_str}\"")
    if y < MIN_BS_YEAR or y > MAX_BS_YEAR:
        raise ValueError(f"BS year {y} is out of supported range [{MIN_BS_YEAR}, {MAX_BS_YEAR}]")
    if m < 1 or m > 12:
        raise ValueError(f"Month {m} is out of range [1, 12]")
    max_day = days_in_month(y, m)
    if d < 1 or d > max_day:
        raise ValueError(f"Day {d} is out of range [1, {max_day}] for BS {y}/{m}")
    return (y, m, d)


def bs_date_to_string(year: int, month: int, day: int) -> str:
    """Format a BS date as a zero-padded YYYY-MM-DD string."""
    return f"{year}-{month:02d}-{day:02d}"


def parse_ad(date_str: str) -> date:
    """
    Parse an AD date string in YYYY-MM-DD format.
    Raises ValueError if malformed or the date parts are invalid.
    """
    parts = date_str.strip().split('-')
    if len(parts) != 3 or any(p == '' for p in parts):
        raise ValueError(f"AD date must be in YYYY-MM-DD format, got: \"{date_str}\"")
    try:
        y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
    except ValueError:
        raise ValueError(f"AD date must be in YYYY-MM-DD format, got: \"{date_str}\"")
    return date(y, m, d)  # raises ValueError on invalid date


def day_of_week_bs(year: int, month: int, day: int) -> int:
    """
    Return the day of week for a BS date.
    0 = Sunday, 1 = Monday, …, 6 = Saturday.
    """
    ad = bs_to_ad(year, month, day)
    # date.weekday(): 0=Monday … 6=Sunday — convert to 0=Sunday convention
    return (ad.weekday() + 1) % 7


def days_in_year(year: int) -> int:
    """Return the total number of days in a BS year (365–367)."""
    if year < MIN_BS_YEAR or year > MAX_BS_YEAR:
        raise ValueError(f"BS year {year} is out of supported range [{MIN_BS_YEAR}, {MAX_BS_YEAR}]")
    return sum(CALENDAR[year])


def compare_bs(
    a: tuple[int, int, int],
    b: tuple[int, int, int],
) -> int:
    """
    Compare two BS dates given as (year, month, day) tuples.
    Returns -1 if a < b, 0 if equal, 1 if a > b.
    """
    if a < b:
        return -1
    if a > b:
        return 1
    return 0
