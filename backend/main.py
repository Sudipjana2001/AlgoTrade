"""
Main FastAPI application.
Indian Stock Market Trading Signals Platform Backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from api.routes import stocks, market, signals
import logging
from database import engine, init_db

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Indian Market Insights API",
    description="Real-time stock data and trading signals for NSE/BSE markets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stocks.router)
app.include_router(market.router)
app.include_router(signals.router)
from api.routes import websocket
app.include_router(websocket.router)
from routes import backtest_routes
app.include_router(backtest_routes.router)
from api.routes import admin_routes
app.include_router(admin_routes.router)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "online",
        "service": "Indian Market Insights API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2026-01-10T21:21:17+05:30"
    }


from services.background_scanner import start_background_scanner

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    init_db()
    logger.info("Starting background tasks...")
    # start_background_scanner()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
