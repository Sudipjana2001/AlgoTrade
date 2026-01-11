import pytest
import pandas as pd
import numpy as np
from services.indicators import calculate_rsi, calculate_macd, calculate_bollinger_bands, calculate_vwap, calculate_all_indicators

@pytest.fixture
def sample_data():
    """Create sample OHLCV data."""
    # Create 50 data points with a trend
    dates = pd.date_range(start="2024-01-01", periods=50, freq="D")
    df = pd.DataFrame({
        "open": np.linspace(100, 150, 50),
        "high": np.linspace(105, 155, 50),
        "low": np.linspace(95, 145, 50),
        "close": np.linspace(102, 152, 50),
        "volume": np.random.randint(1000, 5000, 50)
    }, index=dates)
    return df

def test_rsi_calculation(sample_data):
    """Test RSI calculation."""
    # Test upward trend (RSI should be high)
    rsi = calculate_rsi(sample_data['close'])
    assert 0 <= rsi <= 100
    assert rsi > 50  # Since we have a strict upward trend

    # Test insufficient data
    short_series = sample_data['close'][:10]
    rsi_short = calculate_rsi(short_series)
    assert rsi_short == 50  # Default value

def test_macd_calculation(sample_data):
    """Test MACD calculation."""
    macd = calculate_macd(sample_data['close'])
    assert 'macd' in macd
    assert 'signal' in macd
    assert 'histogram' in macd
    
    # Check values are floats (or ints) and not NaN (at the end)
    assert not np.isnan(macd['histogram'])

def test_bollinger_bands(sample_data):
    """Test Bollinger Bands calculation."""
    bb = calculate_bollinger_bands(sample_data['close'])
    assert 'upper' in bb
    assert 'middle' in bb
    assert 'lower' in bb
    
    # Logic check: upper > middle > lower
    assert bb['upper'] >= bb['middle']
    assert bb['middle'] >= bb['lower']

def test_vwap_calculation(sample_data):
    """Test VWAP calculation."""
    vwap = calculate_vwap(sample_data)
    # VWAP should be close to average price
    avg_price = sample_data['close'].mean()
    assert abs(vwap - avg_price) < 20  # Rough check

def test_calculate_all_indicators(sample_data):
    """Integration test for all indicators wrapper."""
    # Convert to list of dicts as expected by the service
    data_list = []
    for date, row in sample_data.iterrows():
        data_list.append({
            'date': date,
            'open': row['open'],
            'high': row['high'],
            'low': row['low'],
            'close': row['close'],
            'volume': int(row['volume'])
        })
    
    indicators = calculate_all_indicators(data_list)
    assert indicators is not None
    assert 'rsi' in indicators
    assert 'macd' in indicators
    assert 'bollingerBands' in indicators
    assert 'vwap' in indicators
    assert 'ema20' in indicators
