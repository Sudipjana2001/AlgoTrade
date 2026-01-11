from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from database import Base
from datetime import datetime

class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    signal_type = Column(String)  # BUY, SELL, HOLD
    strategy_name = Column(String)
    confidence = Column(Integer)
    entry_price = Column(Float)
    stop_loss = Column(Float)
    target_price = Column(Float)
    risk_reward = Column(Float)
    reasoning = Column(String)
    timestamp = Column(DateTime, default=datetime.now)
    is_active = Column(Boolean, default=True)
    timeframe = Column(String, default="1d")
