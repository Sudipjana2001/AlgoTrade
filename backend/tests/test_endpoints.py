"""
Test script to verify backend API endpoints are working correctly.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(url, description):
    """Test an endpoint and print the result."""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"Response (first 500 chars): {json.dumps(data, indent=2)[:500]}...")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    print("Backend API Endpoint Tests")
    print("=" * 60)
    
    tests = [
        (f"{BASE_URL}/", "Root endpoint"),
        (f"{BASE_URL}/api/market/status", "Market status"),
        (f"{BASE_URL}/api/market/indices", "Market indices"),
        (f"{BASE_URL}/api/stocks/RELIANCE", "Single stock (RELIANCE)"),
        (f"{BASE_URL}/api/stocks/RELIANCE/ohlcv?timeframe=1d&period=1mo&exchange=NSE", "OHLCV data"),
        (f"{BASE_URL}/api/stocks/RELIANCE/indicators?timeframe=1d&exchange=NSE", "Technical indicators"),
        (f"{BASE_URL}/api/signals", "All live signals (GET)"),
        (f"{BASE_URL}/api/signals/RELIANCE", "Signal for RELIANCE (GET)"),
    ]
    
    results = []
    for url, description in tests:
        results.append((description, test_endpoint(url, description)))
    
    print("\n" + "="*60)
    print("Test Summary:")
    print("="*60)
    for description, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {description}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
