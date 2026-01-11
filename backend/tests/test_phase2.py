import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_signal_generation():
    print("Testing Signal Generation...")
    # Trigger generation for a few stocks with low confidence threshold to ensure we get something
    # Note: Using symbols that likely have valid data
    payload = {
        "symbols": ["RELIANCE", "TCS", "INFY", "HDFCBANK"],
        "min_confidence": 10
    }
    try:
        response = requests.post(f"{BASE_URL}/api/signals/generate?min_confidence=10", json=["RELIANCE", "TCS"])
        print(f"Generate Response Code: {response.status_code}")
        print(f"Generate Response: {response.json()}")
        
        if response.status_code == 200:
            return True
        return False
    except Exception as e:
        print(f"Error calling generate: {e}")
        return False

def test_get_signals():
    print("\nTesting Get Signals (from DB)...")
    try:
        response = requests.get(f"{BASE_URL}/api/signals")
        print(f"Get Response Code: {response.status_code}")
        data = response.json()
        print(f"Get Response Count: {data.get('count')}")
        # print(f"Get Response Data: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            return True
        return False
    except Exception as e:
        print(f"Error calling get signals: {e}")
        return False

if __name__ == "__main__":
    # Wait a bit for server reload if needed
    time.sleep(2)
    
    if test_signal_generation():
        time.sleep(1) # Wait for DB write? (It's synchronous in the request, so should be fine)
        test_get_signals()
    else:
        print("Skipping Get Test due to Generate Failure")
