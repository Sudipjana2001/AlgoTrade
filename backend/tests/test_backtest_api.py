"""
Test script for backtesting API endpoints
Run this to verify Phase 6 implementation
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_backtest_api():
    """Test the backtesting API endpoints"""
    
    print("=" * 60)
    print("Testing Phase 6: Backtesting Engine")
    print("=" * 60)
    
    # Test 1: Run a backtest
    print("\n1. Running backtest for RELIANCE.NS...")
    
    backtest_config = {
        "symbol": "RELIANCE.NS",
        "strategy_name": "RSI+MACD",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "initial_capital": 100000
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/backtest/run",
            json=backtest_config,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✓ Backtest completed successfully!")
            print(f"  Result ID: {result.get('id')}")
            print(f"  Status: {result.get('status')}")
            
            if result.get('status') == 'completed':
                print(f"\n  Performance Metrics:")
                print(f"  - Total Trades: {result.get('total_trades')}")
                print(f"  - Win Rate: {result.get('win_rate', 0):.2f}%")
                print(f"  - Total Return: {result.get('total_return_pct', 0):.2f}%")
                print(f"  - Sharpe Ratio: {result.get('sharpe_ratio', 0):.2f}")
                print(f"  - Max Drawdown: {result.get('max_drawdown_pct', 0):.2f}%")
                print(f"  - Profit Factor: {result.get('profit_factor', 0):.2f}")
                print(f"  - Final Capital: ₹{result.get('final_capital', 0):,.2f}")
                
                result_id = result.get('id')
                
                # Test 2: Get specific result
                print(f"\n2. Retrieving backtest result {result_id}...")
                get_response = requests.get(f"{BASE_URL}/api/backtest/results/{result_id}")
                
                if get_response.status_code == 200:
                    print("✓ Successfully retrieved backtest result")
                else:
                    print(f"✗ Failed to retrieve result: {get_response.status_code}")
                
                # Test 3: List all results
                print("\n3. Listing all backtest results...")
                list_response = requests.get(f"{BASE_URL}/api/backtest/results")
                
                if list_response.status_code == 200:
                    results = list_response.json()
                    print(f"✓ Found {len(results)} backtest results")
                    
                    for idx, r in enumerate(results[:3], 1):
                        print(f"  {idx}. {r.get('symbol')} [{r.get('strategy_name')}] - {r.get('win_rate', 0):.1f}% WR")
                else:
                    print(f"✗ Failed to list results: {list_response.status_code}")
                
            else:
                print(f"  Error: {result.get('error_message')}")
        else:
            print(f"✗ Backtest failed with status {response.status_code}")
            print(f"  Response: {response.text}")
    
    except requests.exceptions.Timeout:
        print("✗ Request timed out - backtest may take longer")
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    

if __name__ == "__main__":
    test_backtest_api()
