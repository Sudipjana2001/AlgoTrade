"""
Stock API routes.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from services.data_provider import (
    get_stock_info,
    get_ohlcv_data,
    get_all_nifty50_stocks,
    NIFTY_50_SYMBOLS
)
from services.indicators import calculate_all_indicators
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("")
def list_stocks():
    """Get list of all NIFTY 50 stocks with current prices."""
    try:
        stocks = get_all_nifty50_stocks()
        return {
            "success": True,
            "count": len(stocks),
            "data": stocks
        }
    except Exception as e:
        logger.error(f"Error listing stocks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stocks")


@router.get("/{symbol}")
def get_stock(
    symbol: str,
    exchange: str = Query(default="NSE", pattern="^(NSE|BSE)$")
):
    """Get detailed information for a specific stock."""
    try:
        symbol = symbol.upper()
        stock_data = get_stock_info(symbol, exchange)
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        return {
            "success": True,
            "data": stock_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock data")


@router.get("/{symbol}/ohlcv")
def get_stock_ohlcv(
    symbol: str,
    timeframe: str = Query(default="1d", pattern="^(1m|5m|15m|1h|1d)$"),
    period: str = Query(default="1mo", pattern="^(1d|5d|1mo|3mo|6mo|1y|2y|5y)$"),
    exchange: str = Query(default="NSE", pattern="^(NSE|BSE)$")
):
    """
    Get OHLCV (candlestick) data for a stock.
    
    - timeframe: 1m, 5m, 15m, 1h, 1d
    - period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y
    """
    try:
        symbol = symbol.upper()
        ohlcv = get_ohlcv_data(symbol, timeframe, period, exchange)
        
        if not ohlcv:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        return {
            "success": True,
            "symbol": symbol,
            "timeframe": timeframe,
            "period": period,
            "count": len(ohlcv),
            "data": ohlcv
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching OHLCV for {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch OHLCV data")


@router.get("/{symbol}/indicators")
def get_stock_indicators(
    symbol: str,
    timeframe: str = Query(default="1d", pattern="^(1m|5m|15m|1h|1d)$"),
    exchange: str = Query(default="NSE", pattern="^(NSE|BSE)$")
):
    """Get all technical indicators for a stock."""
    try:
        symbol = symbol.upper()
        
        # Fetch OHLCV data
        ohlcv = get_ohlcv_data(symbol, timeframe, "3mo", exchange)
        
        if not ohlcv:
            logger.warning(f"No OHLCV data for {symbol}")
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Calculate indicators
        try:
            indicators = calculate_all_indicators(ohlcv)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Critical error in calculate_all_indicators for {symbol}: {error_details}")
            raise HTTPException(status_code=500, detail=f"Indicator calculation failed: {str(e)}\n{error_details}")
        
        if not indicators:
            raise HTTPException(status_code=500, detail="Failed to calculate indicators (None returned)")
        
        return {
            "success": True,
            "symbol": symbol,
            "timeframe": timeframe,
            "data": indicators
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Unexpected error in get_stock_indicators for {symbol}: {error_details}")
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{error_details}")
