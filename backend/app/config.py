from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_PORT: int = 8080
    DATABASE_URL: str
    REMOTIVE_BASE: str = "https://remotive.com/api"
    
    # Configurações de segurança
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    # Configurações CORS
    FRONTEND_URL: Optional[str] = None
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Configurações de ambiente
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
