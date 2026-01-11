from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class StrategyConfig(Base):
    __tablename__ = "strategy_configs"

    id = Column(Integer, primary_key=True, index=True)
    strategy_name = Column(String, unique=True, index=True)
    parameters = Column(JSON)  # Stores things like {"rsi_period": 14, "overbought": 70}
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
