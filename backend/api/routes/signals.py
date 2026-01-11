"""
Signal API routes.
Endpoints for generating and retrieving trading signals.
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from services.signal_generator import generate_signal
from services.data_provider import get_stock_info, get_ohlcv_data, NIFTY_50_SYMBOLS
from services.indicators import calculate_all_indicators
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from database import get_db
import models

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/signals", tags=["signals"])


@router.get("")
def get_all_signals(
    min_confidence: int = Query(default=60, ge=0, le=100),
    signal_type: Optional[str] = Query(default=None, pattern="^(BUY|SELL|HOLD)$"),
    limit: int = Query(default=50, ge=1, le=100),
    strategy: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get recent generated signals from the database.
    """
    try:
        query = db.query(models.Signal).filter(models.Signal.is_active == True)
        
        if signal_type:
            query = query.filter(models.Signal.signal_type == signal_type)
        
        if strategy:
            query = query.filter(models.Signal.strategy_name == strategy)
            
        if min_confidence > 0:
            query = query.filter(models.Signal.confidence >= min_confidence)
            
        # Get latest signals first
        signals = query.order_by(desc(models.Signal.timestamp)).limit(limit).all()
        
        return {
            "success": True,
            "count": len(signals),
            "data": signals
        }
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch signals")


@router.get("/{id}")
def get_signal_by_id(
    id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific signal by ID.
    """
    try:
        signal = db.query(models.Signal).filter(models.Signal.id == id).first()
        if not signal:
            raise HTTPException(status_code=404, detail="Signal not found")
        
        return {
            "success": True,
            "data": signal
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching signal {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch signal")


@router.get("/stock/{symbol}")
def get_signal_for_stock(
    symbol: str,
    exchange: str = Query(default="NSE", pattern="^(NSE|BSE)$"),
    strategy: str = Query(default="combined", pattern="^(combined|rsi_macd|bb_volume|ema_crossover|vwap_reversal)$")
):
    """
    Generate a trading signal for a specific stock.
    
    - symbol: Stock symbol (e.g., RELIANCE, TCS)
    - exchange: NSE or BSE
    - strategy: Signal generation strategy
    """
    try:
        symbol = symbol.upper()
        
        # Get current stock info
        stock_data = get_stock_info(symbol, exchange)
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        current_price = stock_data['currentPrice']
        
        # Get OHLCV data
        ohlcv = get_ohlcv_data(symbol, '1d', '3mo', exchange)
        if not ohlcv or len(ohlcv) < 50:
            raise HTTPException(status_code=400, detail=f"Insufficient data for {symbol}")
        
        # Calculate indicators
        indicators = calculate_all_indicators(ohlcv)
        if not indicators:
            raise HTTPException(status_code=500, detail="Failed to calculate indicators")
        
        # Generate signal
        signal = generate_signal(symbol, current_price, indicators, strategy)
        
        # Add stock metadata
        signal['stock'] = {
            'symbol': symbol,
            'name': stock_data['name'],
            'exchange': exchange,
            'sector': stock_data['sector'],
            'currentPrice': current_price,
            'change': stock_data.get('change', 0),
            'changePercent': stock_data.get('changePercent', 0),
            'volume': stock_data.get('volume', 0),
        }
        signal['indicators'] = indicators
        
        return {
            "success": True,
            "data": signal
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating signal for {symbol}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate signal")


@router.post("/generate")
def trigger_signal_generation(
    symbols: Optional[List[str]] = None,
    min_confidence: int = Query(default=60, ge=0, le=100),
    db: Session = Depends(get_db)
):
    """
    Manually trigger signal generation for specified symbols or all NIFTY 50 and save to DB.
    """
    try:
        from services.signal_service import scan_market_and_save_signals
        
        generated, saved = scan_market_and_save_signals(db, symbols, min_confidence)
        
        return {
            "success": True,
            "generated": generated,
            "saved": saved
        }
    except Exception as e:
        logger.error(f"Error in manual signal generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger signal generation")
