import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.services.data_provider import get_stock_info, get_index_value, get_ohlcv_data

print("--- TESTING INDICES ---")
for idx in ['NIFTY', 'BANKNIFTY']:
    print(f"Index {idx}: {get_index_value(idx)}")

print("\n--- TESTING STOCKS ---")
for sym in ['RELIANCE', 'IREDA']:
    print(f"Stock {sym}: {get_stock_info(sym)}")

print("\n--- TESTING OHLCV ---")
ohlcv = get_ohlcv_data('RELIANCE', '1d', '1mo')
print(f"RELIANCE OHLCV count: {len(ohlcv) if ohlcv else 0}")
if ohlcv:
    print(f"Sample: {ohlcv[0]}")
