import json
from datetime import date
from pathlib import Path

MIN_BS_YEAR = 1975
MAX_BS_YEAR = 2100

# ponytail: loads from monorepo root in dev; when publishing, copy calendar.json
# next to _calendar.py as package_data and it'll be preferred automatically
_local = Path(__file__).parent / 'calendar.json'
_root = Path(__file__).parents[4] / 'data' / 'calendar.json'
_raw = json.loads((_local if _local.exists() else _root).read_text())

REFERENCE_AD = date(1918, 4, 13)  # BS 1975-01-01

MONTH_NAMES_EN = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra',
]

MONTH_NAMES = MONTH_NAMES_EN  # deprecated alias

MONTH_NAMES_NP = [
    'बैशाख', 'जेठ', 'असार', 'साउन',
    'भदौ', 'असोज', 'कार्तिक', 'मंसिर',
    'पुस', 'माघ', 'फागुन', 'चैत',
]

# Sunday = 0, Monday = 1, …, Saturday = 6
DAY_NAMES_EN = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

DAY_NAMES_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

DAY_NAMES_NP = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार',
]

DAY_NAMES_NP_SHORT = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि']

CALENDAR: dict[int, tuple[int, ...]] = {int(k): tuple(v) for k, v in _raw.items()}
