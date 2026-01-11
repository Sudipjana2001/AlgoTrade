import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.data_provider import get_stock_info

print("Testing get_stock_info for RELIANCE...")
info = get_stock_info("RELIANCE")
print(f"Result: {info}")
