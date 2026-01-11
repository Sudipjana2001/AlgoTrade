import yfinance as yf
try:
    ticker = yf.Ticker("IREDA.NS")
    info = ticker.info
    print(f"Symbol: {info.get('symbol')}")
    print(f"Current Price: {info.get('currentPrice')}")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
