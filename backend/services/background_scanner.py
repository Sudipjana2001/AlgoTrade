import asyncio
import logging
from database import SessionLocal
from services.signal_service import scan_market_and_save_signals
from services.websocket_manager import manager

logger = logging.getLogger(__name__)

async def run_scanner_loop():
    while True:
        try:
            logger.info("Starting background market scan...")
            db = SessionLocal()
            try:
                # Run sync function in thread pool to avoid blocking the event loop
                loop = asyncio.get_running_loop()
                generated, saved = await loop.run_in_executor(None, scan_market_and_save_signals, db)
                
                if saved > 0:
                    logger.info(f"Broadcasting {saved} new signals to clients")
                    await manager.broadcast({
                        "type": "NEW_SIGNALS",
                        "count": saved,
                        "timestamp": str(asyncio.get_event_loop().time()) 
                    })
                    
            finally:
                db.close()
            
            # Wait for 15 minutes (900 seconds)
            await asyncio.sleep(900)
        except Exception as e:
            logger.error(f"Error in background scanner: {e}")
            await asyncio.sleep(60) # Retry after 1 min on error

def start_background_scanner():
    loop = asyncio.get_event_loop()
    loop.create_task(run_scanner_loop())
