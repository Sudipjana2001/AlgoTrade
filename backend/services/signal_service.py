import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Optional

from services.signal_generator import generate_signal
from services.data_provider import get_stock_info, get_ohlcv_data, NIFTY_50_SYMBOLS
from services.indicators import calculate_all_indicators
from services.websocket_manager import manager
from models.admin_models import StrategyConfig
import models
import asyncio

logger = logging.getLogger(__name__)

def scan_market_and_save_signals(db: Session, symbols: Optional[List[str]] = None, min_confidence: int = 60):
    """
    Scans the market (or provided symbols) for trading signals and saves them to the DB.
    """
    target_symbols = symbols if symbols else NIFTY_50_SYMBOLS
    active_signals = []
    
    # Load Strategy Config
    configs = db.query(StrategyConfig).filter(StrategyConfig.is_active == True).all()
    config_dict = {c.strategy_name: c.parameters for c in configs}
    
    def _process_symbol(symbol):
        try:
            stock_data = get_stock_info(symbol)
            if not stock_data: return None
            
            ohlcv = get_ohlcv_data(symbol, '1d', '3mo')
            if not ohlcv or len(ohlcv) < 50: return None
            
            indicators = calculate_all_indicators(ohlcv)
            if not indicators: return None
            
            signal = generate_signal(symbol, stock_data['currentPrice'], indicators, config=config_dict)
            
            if signal['confidence'] >= min_confidence:
                return signal
            return None
        except Exception as e:
            logger.warning(f"Failed to generate signal for {symbol}: {e}")
            return None

    # Scan in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_symbol = {executor.submit(_process_symbol, s): s for s in target_symbols}
        for future in as_completed(future_to_symbol):
            res = future.result()
            if res and res['signal'] in ['BUY', 'SELL']: # Only interesting signals
                active_signals.append(res)
    
    # Save to Database
    saved_count = 0
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    for sig_data in active_signals:
        # Deduplication: Check if we already have a signal for this symbol generated today
        existing = db.query(models.Signal).filter(
            models.Signal.symbol == sig_data['symbol'],
            models.Signal.timestamp >= today_start
        ).first()
        
        if not existing:
            db_signal = models.Signal(
                symbol=sig_data['symbol'],
                signal_type=sig_data['signal'],
                strategy_name='combined',
                confidence=sig_data['confidence'],
                entry_price=sig_data['entry_price'],
                stop_loss=sig_data['stop_loss'],
                target_price=sig_data['target'],
                risk_reward=sig_data['risk_reward'],
                reasoning=sig_data['reasoning'],
                timestamp=now
            )
            db.add(db_signal)
            try:
                msg = {
                    "type": "SIGNAL_UPDATE",
                    "data": {
                        "symbol": db_signal.symbol,
                        "type": db_signal.signal_type,
                        "price": db_signal.entry_price,
                        "confidence": db_signal.confidence,
                        "timestamp": db_signal.timestamp.isoformat()
                    }
                }
                # Use uvicorn's running loop if possible, or fire and forget
                # Since we are likely in a separate thread, we need to be careful.
                # The safest way in this specific architecture (FastAPI + Background Tasks) 
                # is to use the manager's broadcast method which is async.
                # However, since this calculation happens in a thread pool, we need to bridge it.
                
                # For now, we'll try to get the running loop (from the main thread) or create one
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = None
                
                if loop:
                    asyncio.run_coroutine_threadsafe(manager.broadcast(msg), loop)
                else:
                    # Fallback for when running outside of main event loop (e.g. tests)
                    # or if loop not accessible
                    pass
            except Exception as wse:
                logger.error(f"Failed to broadcast signal: {wse}")
    
    if saved_count > 0:
        db.commit()
    
    logger.info(f"Market scan complete. generated={len(active_signals)}, saved={saved_count}")
    return len(active_signals), saved_count


class SignalService:
    """Signal service class for generating trading signals"""
    
    def __init__(self):
        pass
    
    def scan_market_and_save_signals(self, db: Session, symbols: Optional[List[str]] = None, min_confidence: int = 60):
        """Scan market and save signals"""
        return scan_market_and_save_signals(db, symbols, min_confidence)

