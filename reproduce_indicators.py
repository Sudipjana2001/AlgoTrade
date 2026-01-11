import sys
import os
import logging

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.data_provider import get_ohlcv_data
from services.indicators import calculate_all_indicators

logging.basicConfig(level=logging.INFO)

symbol = "RELIANCE"
timeframe = "1d"
period = "3mo"
exchange = "NSE"

print(f"Fetching data for {symbol}...")
ohlcv = get_ohlcv_data(symbol, timeframe, period, exchange)
print(f"Data length: {len(ohlcv)}")

print("Calculating indicators...")
try:
    indicators = calculate_all_indicators(ohlcv)
    print("Success!")
    print(indicators)
except Exception as e:
    import traceback
    print("FAILED!")
    traceback.print_exc()
