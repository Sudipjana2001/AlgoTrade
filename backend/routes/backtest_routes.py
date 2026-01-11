"""
Backtesting API Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from models.backtest_models import BacktestConfig, BacktestResult
from services.backtest_engine import BacktestEngine


router = APIRouter(prefix="/api/backtest", tags=["backtest"])


# Pydantic models for request/response
class BacktestRequest(BaseModel):
    symbol: str
    strategy_name: str
    start_date: str
    end_date: str
    initial_capital: float = 100000


class BacktestResponse(BaseModel):
    id: str
    status: str
    symbol: str
    strategy_name: str
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: Optional[float] = None
    total_return: Optional[float] = None
    total_return_pct: Optional[float] = None
    win_rate: Optional[float] = None
    profit_factor: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    max_drawdown_pct: Optional[float] = None
    total_trades: Optional[int] = None
    winning_trades: Optional[int] = None
    losing_trades: Optional[int] = None
    avg_win: Optional[float] = None
    avg_loss: Optional[float] = None
    equity_curve: Optional[list] = None
    trades: Optional[list] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/run", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest, db: Session = Depends(get_db)):
    """
    Execute a backtest with the given parameters
    """
    try:
        # Create config record
        config = BacktestConfig(
            id=str(uuid.uuid4()),
            symbol=request.symbol,
            strategy_name=request.strategy_name,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital
        )
        db.add(config)
        db.commit()
        
        # Run backtest
        engine = BacktestEngine(
            symbol=request.symbol,
            strategy_name=request.strategy_name,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital
        )
        
        result_data = engine.run()
        
        # Create result record
        result = BacktestResult(
            id=str(uuid.uuid4()),
            config_id=config.id,
            symbol=request.symbol,
            strategy_name=request.strategy_name,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_capital,
            status=result_data.get("status", "completed")
        )
        
        if result_data["status"] == "completed":
            metrics = result_data["metrics"]
            result.total_return = metrics["total_return"]
            result.total_return_pct = metrics["total_return_pct"]
            result.win_rate = metrics["win_rate"]
            result.profit_factor = metrics["profit_factor"]
            result.sharpe_ratio = metrics["sharpe_ratio"]
            result.max_drawdown = metrics["max_drawdown"]
            result.max_drawdown_pct = metrics["max_drawdown_pct"]
            result.total_trades = metrics["total_trades"]
            result.winning_trades = metrics["winning_trades"]
            result.losing_trades = metrics["losing_trades"]
            result.avg_win = metrics["avg_win"]
            result.avg_loss = metrics["avg_loss"]
            result.final_capital = metrics["final_capital"]
            result.equity_curve = result_data["equity_curve"]
            result.trades = result_data["trades"]
        else:
            result.error_message = result_data.get("error", "Unknown error")
        
        db.add(result)
        db.commit()
        db.refresh(result)
        
        return result
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")


@router.get("/results/{result_id}", response_model=BacktestResponse)
async def get_backtest_result(result_id: str, db: Session = Depends(get_db)):
    """
    Get a specific backtest result by ID
    """
    result = db.query(BacktestResult).filter(BacktestResult.id == result_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Backtest result not found")
    
    return result


@router.get("/results", response_model=List[BacktestResponse])
async def list_backtest_results(
    symbol: Optional[str] = None,
    strategy: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List all backtest results with optional filters
    """
    query = db.query(BacktestResult)
    
    if symbol:
        query = query.filter(BacktestResult.symbol == symbol)
    
    if strategy:
        query = query.filter(BacktestResult.strategy_name == strategy)
    
    results = query.order_by(BacktestResult.created_at.desc()).limit(limit).all()
    
    return results


@router.delete("/results/{result_id}")
async def delete_backtest_result(result_id: str, db: Session = Depends(get_db)):
    """
    Delete a backtest result
    """
    result = db.query(BacktestResult).filter(BacktestResult.id == result_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Backtest result not found")
    
    db.delete(result)
    db.commit()
    
    return {"message": "Backtest result deleted successfully"}
