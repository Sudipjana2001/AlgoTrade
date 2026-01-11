from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from database import get_db
from models.admin_models import StrategyConfig
from pydantic import BaseModel
from typing import Dict, Any, List
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Models ---
class LoginRequest(BaseModel):
    password: str

class StrategyConfigUpdate(BaseModel):
    parameters: Dict[str, Any]
    is_active: bool

class StrategyConfigCreate(BaseModel):
    strategy_name: str
    parameters: Dict[str, Any]
    is_active: bool = True

# --- Auth Helper ---
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def verify_admin(password: str = Body(..., embed=True)):
    if password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return True

# --- Routes ---

@router.post("/auth/login")
async def admin_login(login: LoginRequest):
    if login.password == ADMIN_PASSWORD:
        return {"success": True, "token": "dummy-token-session"} # Simple auth for now
    raise HTTPException(status_code=401, detail="Invalid password")

@router.get("/strategies")
async def get_strategies(db: Session = Depends(get_db)):
    strategies = db.query(StrategyConfig).all()
    return {"success": True, "data": strategies}

@router.post("/strategies")
async def create_strategy(config: StrategyConfigCreate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(StrategyConfig).filter(StrategyConfig.strategy_name == config.strategy_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Strategy already exists")
    
    new_config = StrategyConfig(
        strategy_name=config.strategy_name,
        parameters=config.parameters,
        is_active=config.is_active
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"success": True, "data": new_config}

@router.put("/strategies/{strategy_name}")
async def update_strategy(strategy_name: str, update: StrategyConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(StrategyConfig).filter(StrategyConfig.strategy_name == strategy_name).first()
    
    if not config:
        # Auto-create if not exists (lazy init)
        config = StrategyConfig(
            strategy_name=strategy_name,
            parameters=update.parameters,
            is_active=update.is_active
        )
        db.add(config)
    else:
        config.parameters = update.parameters
        config.is_active = update.is_active
    
    db.commit()
    db.refresh(config)
    return {"success": True, "data": config}

@router.post("/scan")
async def trigger_manual_scan(
    symbols: List[str] = Body(default=["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "SBIN.NS"]), 
    db: Session = Depends(get_db)
):
    """
    Trigger a manual market scan.
    """
    try:
        from services.signal_service import scan_market_and_save_signals
        generated, saved = scan_market_and_save_signals(db, symbols=symbols)
        return {"success": True, "message": f"Scan complete. Generated {generated}, Saved {saved} signals."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
