"""
Market status and trading hours management for NSE/BSE.
Handles IST timezone, market hours (9:15 AM - 3:30 PM), and holidays.
"""
from datetime import datetime, time
from typing import Dict
import pytz


# IST Timezone
IST = pytz.timezone('Asia/Kolkata')

# Market hours
MARKET_OPEN_TIME = time(9, 15)  # 9:15 AM
MARKET_CLOSE_TIME = time(15, 30)  # 3:30 PM

# NSE/BSE Holidays for 2026 (Indian stock market)
MARKET_HOLIDAYS_2026 = [
    datetime(2026, 1, 26),  # Republic Day
    datetime(2026, 3, 14),  # Holi
    datetime(2026, 3, 30),  # Ram Navami
    datetime(2026, 4, 2),   # Mahavir Jayanti
    datetime(2026, 4, 3),   # Good Friday
    datetime(2026, 4, 14),  # Dr. Ambedkar Jayanti
    datetime(2026, 5, 1),   # Maharashtra Day
    datetime(2026, 8, 15),  # Independence Day
    datetime(2026, 8, 26),  # Janmashtami
    datetime(2026, 10, 2),  # Gandhi Jayanti
    datetime(2026, 10, 19), # Dussehra
    datetime(2026, 10, 24), # Diwali - Laxmi Pujan
    datetime(2026, 10, 26), # Diwali - Balipratipada
    datetime(2026, 11, 16), # Guru Nanak Jayanti
    datetime(2026, 12, 25), # Christmas
]


def get_current_ist_time() -> datetime:
    """Get current time in IST timezone."""
    return datetime.now(IST)


def is_market_open() -> bool:
    """
    Check if the market is currently open.
    Returns True if:
    - It's a weekday (Monday-Friday)
    - Not a holiday
    - Current time is between 9:15 AM and 3:30 PM IST
    """
    now = get_current_ist_time()
    
    # Check if weekend
    if now.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    
    # Check if holiday
    if is_holiday(now):
        return False
    
    # Check market hours
    current_time = now.time()
    return MARKET_OPEN_TIME <= current_time < MARKET_CLOSE_TIME


def is_holiday(date: datetime) -> bool:
    """Check if given date is a market holiday."""
    date_only = date.date()
    return any(holiday.date() == date_only for holiday in MARKET_HOLIDAYS_2026)


def is_trading_day(date: datetime = None) -> bool:
    """Check if given date (or today) is a trading day."""
    if date is None:
        date = get_current_ist_time()
    
    # Weekend check
    if date.weekday() >= 5:
        return False
    
    # Holiday check
    return not is_holiday(date)


def get_market_session() -> str:
    """
    Get current market session.
    Returns: 'Pre-Market', 'Market Hours', 'Post-Market', or 'Weekend'
    """
    now = get_current_ist_time()
    
    # Weekend
    if now.weekday() >= 5:
        return 'Weekend'
    
    # Holiday
    if is_holiday(now):
        return 'Holiday'
    
    current_time = now.time()
    
    if current_time < MARKET_OPEN_TIME:
        return 'Pre-Market'
    elif current_time < MARKET_CLOSE_TIME:
        return 'Market Hours'
    else:
        return 'Post-Market'


def get_next_market_event() -> str:
    """Get description of when market opens/closes next."""
    now = get_current_ist_time()
    session = get_market_session()
    
    if session == 'Weekend':
        return 'Opens Monday 9:15 AM IST'
    elif session == 'Holiday':
        return 'Market Holiday - Opens next trading day 9:15 AM IST'
    elif session == 'Pre-Market':
        return 'Opens at 9:15 AM IST'
    elif session == 'Market Hours':
        return 'Closes at 3:30 PM IST'
    else:  # Post-Market
        return 'Opens tomorrow 9:15 AM IST'


def get_market_status() -> Dict[str, any]:
    """
    Get comprehensive market status.
    Returns dict with: isOpen, session, nextEvent
    """
    return {
        'isOpen': is_market_open(),
        'session': get_market_session(),
        'nextEvent': get_next_market_event(),
        'timestamp': get_current_ist_time().isoformat()
    }
