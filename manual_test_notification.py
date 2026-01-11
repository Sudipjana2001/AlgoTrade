"""
Test Script to simulate a signal broadcast for testing Frontend Notifications.
Run this script while the frontend is connected to localhost:8000
"""
import asyncio
import websockets
import json

async def trigger_signal():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        print(f"Connected to {uri}")
        
        # In a real scenario, the backend broadcasts this.
        # However, for this test, we are just a client.
        # If the backend is set up to echo or if we modify the backend to specific test endpoint, we can test.
        # BUT, the backend `scan_market_and_save_signals` broadcasts to ALL clients.
        # So we should call the API endpoint that triggers the scan/signal generation.
        
        print("To verify functionality:")
        print("1. Ensure your browser is open on http://localhost:8080")
        print("2. I will call the REST API '/api/signals/scan' which triggers signal generation and broadcast.")
        
        # We can't trigger the broadcast directly from here unless we are the server.
        # So we will use requests to hit the scan endpoint.

import requests
import time

def trigger_via_api():
    print("Triggering signal scan via API...")
    try:
        # We need to make sure we actually generate a signal.
        # We'll force a signal if possible or just rely on market data.
        # For testing, let's assume the scan will find something or we can mock it?
        # Since we can't easily mock the DB state from here, we will trust the scan.
        response = requests.post("http://localhost:8000/api/signals/generate", params={"symbols": "RELIANCE.NS"})
        print(f"Scan response: {response.status_code} - {response.text}")
        if response.status_code == 200:
            print("Scan triggered successfully. Check frontend for toast!")
    except Exception as e:
        print(f"Failed to trigger scan: {e}")

if __name__ == "__main__":
    trigger_via_api()
