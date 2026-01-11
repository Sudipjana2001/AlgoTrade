"""
Technical indicators calculation service.
Implements RSI, MACD, EMA, SMA, Bollinger Bands, VWAP, ATR, and volume analysis.
"""
import pandas as pd
import pandas_ta as ta
import numpy as np
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


def calculate_rsi(prices: pd.Series, period: int = 14) -> float:
    """
    Calculate Relative Strength Index.
    
    Args:
        prices: Series of closing prices
        period: RSI period (default 14)
    
    Returns:
        Current RSI value (0-100)
    """
    try:
        rsi = ta.rsi(prices, length=period)
        return round(rsi.iloc[-1], 2) if not pd.isna(rsi.iloc[-1]) else 50.0
    except:
        return 50.0


def calculate_macd(prices: pd.Series) -> Dict[str, float]:
    """
    Calculate MACD (Moving Average Convergence Divergence).
    
    Returns:
        Dict with 'value', 'signal', and 'histogram'
    """
    try:
        macd = ta.macd(prices, fast=12, slow=26, signal=9)
        if macd is None or macd.empty:
            return {'value': 0.0, 'signal': 0.0, 'histogram': 0.0}
        
        return {
            'value': round(macd['MACD_12_26_9'].iloc[-1], 2),
            'signal': round(macd['MACDs_12_26_9'].iloc[-1], 2),
            'histogram': round(macd['MACDh_12_26_9'].iloc[-1], 2)
        }
    except:
        return {'value': 0.0, 'signal': 0.0, 'histogram': 0.0}


def calculate_ema(prices: pd.Series, period: int) -> float:
    """
    Calculate Exponential Moving Average.
    
    Args:
        prices: Series of closing prices
        period: EMA period
    
    Returns:
        Current EMA value
    """
    try:
        ema = ta.ema(prices, length=period)
        return round(ema.iloc[-1], 2) if not pd.isna(ema.iloc[-1]) else prices.iloc[-1]
    except:
        return prices.iloc[-1]


def calculate_sma(prices: pd.Series, period: int) -> float:
    """
    Calculate Simple Moving Average.
    
    Args:
        prices: Series of closing prices
        period: SMA period
    
    Returns:
        Current SMA value
    """
    try:
        sma = ta.sma(prices, length=period)
        return round(sma.iloc[-1], 2) if not pd.isna(sma.iloc[-1]) else prices.iloc[-1]
    except:
        return prices.iloc[-1]


def calculate_bollinger_bands(prices: pd.Series, period: int = 20, std_dev: int = 2) -> Dict[str, float]:
    """
    Calculate Bollinger Bands.
    
    Returns:
        Dict with 'upper', 'middle', 'lower'
    """
    try:
        bbands = ta.bbands(prices, length=period, std=std_dev)
        if bbands is None or bbands.empty:
            current_price = prices.iloc[-1]
            return {'upper': current_price, 'middle': current_price, 'lower': current_price}
        
        return {
            'upper': round(bbands[f'BBU_{period}_{std_dev}.0'].iloc[-1], 2),
            'middle': round(bbands[f'BBM_{period}_{std_dev}.0'].iloc[-1], 2),
            'lower': round(bbands[f'BBL_{period}_{std_dev}.0'].iloc[-1], 2)
        }
    except:
        current_price = prices.iloc[-1]
        return {'upper': current_price, 'middle': current_price, 'lower': current_price}


def calculate_vwap(df: pd.DataFrame) -> float:
    """
    Calculate Volume Weighted Average Price.
    
    Args:
        df: DataFrame with 'high', 'low', 'close', 'volume' columns
    
    Returns:
        Current VWAP value
    """
    try:
        vwap = ta.vwap(df['high'], df['low'], df['close'], df['volume'])
        return round(vwap.iloc[-1], 2) if not pd.isna(vwap.iloc[-1]) else df['close'].iloc[-1]
    except:
        return df['close'].iloc[-1]


def calculate_atr(df: pd.DataFrame, period: int = 14) -> float:
    """
    Calculate Average True Range (volatility measure).
    
    Args:
        df: DataFrame with 'high', 'low', 'close' columns
        period: ATR period
    
    Returns:
        Current ATR value
    """
    try:
        atr = ta.atr(df['high'], df['low'], df['close'], length=period)
        return round(atr.iloc[-1], 2) if not pd.isna(atr.iloc[-1]) else 0.0
    except:
        return 0.0


def detect_volume_spike(volumes: pd.Series, threshold: float = 1.5) -> bool:
    """
    Detect if current volume is significantly higher than average.
    
    Args:
        volumes: Series of volume data
        threshold: Multiplier for average volume (default 1.5x)
    
    Returns:
        True if volume spike detected
    """
    try:
        if len(volumes) < 20:
            return False
        
        avg_volume = volumes.iloc[-20:].mean()
        current_volume = volumes.iloc[-1]
        
        return current_volume > (avg_volume * threshold)
    except:
        return False


def convert_to_native(data):
    """Recursively convert numpy types to native Python types for JSON serialization."""
    if isinstance(data, dict):
        return {k: convert_to_native(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_native(i) for i in data]
    elif isinstance(data, (np.float64, np.float32, np.float16)):
        return float(data)
    elif isinstance(data, (np.int64, np.int32, np.int16, np.int8)):
        return int(data)
    elif isinstance(data, (np.bool_, bool)):
        return bool(data)
    elif pd.isna(data):
        return None
    return data


def calculate_all_indicators(ohlcv_data: List[Dict]) -> Optional[Dict]:
    """
    Calculate all technical indicators from OHLCV data.
    """
    try:
        if not ohlcv_data or len(ohlcv_data) < 50:
            logger.warning("Insufficient data for indicators calculation")
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(ohlcv_data)
        
        # Ensure proper column names (lowercase)
        df.columns = [col.lower() for col in df.columns]
        
        # FIX: Ensure numeric types for calculation
        for col in ['open', 'high', 'low', 'close', 'volume']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # FIX: Ensure DatetimeIndex for indicators like VWAP
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            
        # Get closing prices
        closes = df['close']
        
        # Calculate all indicators
        indicators = {
            'rsi': calculate_rsi(closes),
            'macd': calculate_macd(closes),
            'ema20': calculate_ema(closes, 20),
            'ema50': calculate_ema(closes, 50),
            'sma200': calculate_sma(closes, 200) if len(closes) >= 200 else closes.iloc[-1],
            'bollingerBands': calculate_bollinger_bands(closes),
            'vwap': calculate_vwap(df),
            'atr': calculate_atr(df),
            'volumeSpike': detect_volume_spike(df['volume'])
        }
        
        # FIX: Convert to native types for JSON serialization
        return convert_to_native(indicators)
    except Exception as e:
        logger.error(f"Error calculating indicators: {e}")
        return None


def get_indicator_signals(indicators: Dict) -> List[str]:
    """
    Analyze indicators and return signal hints.
    
    Returns:
        List of signal descriptions
    """
    signals = []
    
    try:
        rsi = indicators.get('rsi', 50)
        macd = indicators.get('macd', {})
        bbands = indicators.get('bollingerBands', {})
        volume_spike = indicators.get('volumeSpike', False)
        
        # RSI signals
        if rsi < 30:
            signals.append("RSI oversold (<30)")
        elif rsi > 70:
            signals.append("RSI overbought (>70)")
        elif rsi < 40:
            signals.append("RSI approaching oversold")
        elif rsi > 60:
            signals.append("RSI approaching overbought")
        
        # MACD signals
        if macd.get('histogram', 0) > 0:
            signals.append("MACD bullish (histogram positive)")
        else:
            signals.append("MACD bearish (histogram negative)")
        
        # Volume signal
        if volume_spike:
            signals.append("High volume spike detected")
        
        return signals
    except:
        return []
