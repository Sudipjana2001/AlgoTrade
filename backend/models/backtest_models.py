from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from sqlalchemy.sql import func
from database import Base
import uuid


class BacktestConfig(Base):
    """Model for storing backtest configuration"""
    __tablename__ = "backtest_configs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String, nullable=False)
    strategy_name = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    initial_capital = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BacktestResult(Base):
    """Model for storing backtest results"""
    __tablename__ = "backtest_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    config_id = Column(String, nullable=False)
    
    # Configuration data (for easy access)
    symbol = Column(String, nullable=False)
    strategy_name = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    initial_capital = Column(Float, nullable=False)
    
    # Performance Metrics
    total_return = Column(Float)
    total_return_pct = Column(Float)
    win_rate = Column(Float)
    profit_factor = Column(Float)
    sharpe_ratio = Column(Float)
    max_drawdown = Column(Float)
    max_drawdown_pct = Column(Float)
    
    total_trades = Column(Integer)
    winning_trades = Column(Integer)
    losing_trades = Column(Integer)
    avg_win = Column(Float)
    avg_loss = Column(Float)
    
    # Final values
    final_capital = Column(Float)
    
    # Detailed data stored as JSON
    equity_curve = Column(JSON)  # Time series of portfolio value
    trades = Column(JSON)  # List of all trades executed
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="completed")  # completed, failed, running
    error_message = Column(Text, nullable=True)
