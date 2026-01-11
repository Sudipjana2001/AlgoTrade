import requests

url = "http://127.0.0.1:8000/api/stocks/RELIANCE/indicators?timeframe=1d&exchange=NSE"
headers = {"Origin": "http://localhost:8080"}

try:
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Headers: {response.headers}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
