import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.services.data_provider import get_stock_info

print("Testing get_stock_info for RELIANCE...")
result = get_stock_info("RELIANCE")
print(f"Result: {result}")

print("\nTesting get_stock_info for IREDA...")
result = get_stock_info("IREDA")
print(f"Result: {result}")
