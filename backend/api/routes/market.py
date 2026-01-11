"""
Market status API routes.
"""
from fastapi import APIRouter, HTTPException
from services.market_status import get_market_status
from services.data_provider import get_index_value
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/status")
def market_status():
    """Get current market status (open/closed, session, next event)."""
    try:
        status = get_market_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        logger.error(f"Error fetching market status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market status")


@router.get("/indices")
def market_indices():
    """Get current values of major indices (NIFTY 50, BANK NIFTY)."""
    try:
        nifty = get_index_value('NIFTY')
        bank_nifty = get_index_value('BANKNIFTY')
        
        indices = []
        if nifty:
            indices.append(nifty)
        if bank_nifty:
            indices.append(bank_nifty)
        
        return {
            "success": True,
            "data": indices
        }
    except Exception as e:
        logger.error(f"Error fetching indices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch indices")
