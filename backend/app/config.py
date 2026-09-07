import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelPrompt"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Security & Auth
    API_KEYS: List[str] = [
        "sp_live_9f8a3c2e1b7d4a6e8f0c2b4a6d8e0f1a",
        "sp_test_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
    ]
    ENABLE_AUTH: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Risk Score Thresholds (0 - 100)
    # SAFE: 0 to SAFE_THRESHOLD_MAX
    # SUSPICIOUS: (SAFE_THRESHOLD_MAX + 1) to SUSPICIOUS_THRESHOLD_MAX
    # BLOCKED: BLOCKED_THRESHOLD_MIN to 100
    SAFE_THRESHOLD_MAX: int = 39
    SUSPICIOUS_THRESHOLD_MAX: int = 69
    BLOCKED_THRESHOLD_MIN: int = 70
    
    # Layer 2 Vector Similarity Thresholds
    SIMILARITY_FLAG_THRESHOLD: float = 0.65
    SIMILARITY_BLOCK_THRESHOLD: float = 0.82
    
    # Layer 3 LLM Reasoning Trigger Range
    LLM_REASONING_MIN_SCORE: int = 35
    LLM_REASONING_MAX_SCORE: int = 75
    
    # External LLM Keys (optional - system falls back to smart local intent classifier)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinel.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
