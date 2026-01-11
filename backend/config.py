"""
Configuration management for the application.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    allowed_origins: str = "http://localhost:5173,http://localhost:8080"
    
    # Data Provider
    data_provider: str = "yahoo_finance"
    rate_limit_requests: int = 200
    rate_limit_period: int = 60
    
    # Signal Generation
    signal_scan_interval: int = 60
    min_confidence_score: int = 70
    
    # Admin
    admin_password: str = "admin123"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def get_allowed_origins(self) -> List[str]:
        """Parse allowed origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
