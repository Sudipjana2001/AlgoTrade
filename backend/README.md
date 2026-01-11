# Indian Market Insights - Backend API

FastAPI backend for real-time Indian stock market data and trading signals.

## Features

- **Real-time Stock Data**: NSE/BSE stock prices using Yahoo Finance
- **Technical Indicators**: RSI, MACD, EMA, SMA, Bollinger Bands, VWAP, ATR
- **Market Status**: Market hours, holidays, session tracking (IST timezone)
- **REST API**: Clean, documented endpoints
- **Auto CORS**: Configured for frontend integration

## Setup

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment** (optional):
   Copy `.env.example` to `.env` and modify if needed

3. **Run the Server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Access API Documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Stocks
- `GET /api/stocks` - List all NIFTY 50 stocks
- `GET /api/stocks/{symbol}` - Get stock details
- `GET /api/stocks/{symbol}/ohlcv` - Get OHLCV data
- `GET /api/stocks/{symbol}/indicators` - Get technical indicators

### Market
- `GET /api/market/status` - Market status (open/closed)
- `GET /api/market/indices` - NIFTY 50 & BANK NIFTY values

## Technology Stack

- **FastAPI**: High-performance async web framework
- **yfinance**: Yahoo Finance data provider
- **pandas-ta**: Technical analysis indicators
- **pydantic**: Data validation
- **pytz**: Timezone handling

## Market Hours

- **Trading Hours**: 9:15 AM - 3:30 PM IST (Monday-Friday)
- **Holidays**: NSE/BSE calendar for 2026 included
- **Auto-pause**: Data fetching pauses outside market hours

## Example Usage

```python
import requests

# Get all stocks
response = requests.get("http://localhost:8000/api/stocks")
stocks = response.json()["data"]

# Get RELIANCE stock OHLCV data
response = requests.get(
    "http://localhost:8000/api/stocks/RELIANCE/ohlcv",
    params={"timeframe": "5m", "period": "1d"}
)
ohlcv = response.json()["data"]

# Get indicators
response = requests.get("http://localhost:8000/api/stocks/RELIANCE/indicators")
indicators = response.json()["data"]
```

## Development

Install dependencies:
```bash
pip install -r requirements.txt
```

Run with auto-reload:
```bash
uvicorn main:app --reload
```

## License

For educational and research purposes only. Not SEBI-registered investment advice.
