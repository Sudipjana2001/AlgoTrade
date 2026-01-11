from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = "sqlite:///./trading.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    # Import all models to ensure they are registered with Base
    try:
        from models.backtest_models import BacktestConfig, BacktestResult
        from models.admin_models import StrategyConfig
        from models.signal_models import Signal
        logger.info("All models imported successfully for DB initialization.")
    except ImportError as e:
        logger.error(f"Failed to import models for DB initialization: {e}")
        
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
