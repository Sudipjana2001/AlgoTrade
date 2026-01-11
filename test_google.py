import requests
import re

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
})

def get_stock_info_google(symbol: str, exchange: str = 'NSE'):
    try:
        # Google Finance uses "EXCHANGE:SYMBOL" format
        market = "NSE" if exchange == "NSE" else "BOM"
        url = f"https://www.google.com/finance/quote/{symbol}:{market}"
        print(f"Fetching {url}...")
        response = session.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"Failed: {response.status_code}")
            return None
            
        html = response.text
        print(f"Length: {len(html)}")
        
        # Pattern 1: <div class="YMlKec fxKbKc">245.05</div>
        price_match = re.search(r'<div class="YMlKec fxKbKc">₹?([\d,]+\.?\d*)</div>', html)
        
        if not price_match:
             # Pattern 2: data-last-price="245.05"
            price_match = re.search(r'data-last-price="([\d\.]+)"', html)
            
        if price_match:
            price_str = price_match.group(1).replace(',', '')
            print(f"Found Price: {price_str}")
            return float(price_str)
        else:
            print("Price pattern not found")
            # Save html for inspection?
            # with open("google_dump.html", "w", encoding="utf-8") as f:
            #     f.write(html)
            return None

    except Exception as e:
        print(f"Error: {e}")
        return None

# Test with IREDA and RELIANCE
print("Testing IREDA...")
get_stock_info_google("IREDA")
print("\nTesting RELIANCE...")
get_stock_info_google("RELIANCE")
