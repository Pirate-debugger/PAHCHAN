"""
PAHCHAN Core Application Configuration
Smart India Hackathon 2026 — Problem Statement SIH2026188
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Dict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "PAHCHAN"
    TAGLINE: str = "Verify Identity. Detect Risk. Protect Trust."
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    # Explicit CORS allow-list for frontend development and production
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ]
    CORS_ALLOW_CREDENTIALS: bool = False
    
    # Authentication (API-Key Gated Write Endpoints)
    API_KEY: str = "pahchan-secret-api-key-2026"
    API_KEY_NAME: str = "X-API-Key"
    
    # Storage & Database
    SQLITE_DB_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pahchan_audit.db")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    
    # Biometric Face Threshold
    DEFAULT_FACE_THRESHOLD: float = 75.0
    
    # Configurable Default Risk Weights (Additive 0 to 100)
    DEFAULT_RISK_WEIGHTS: Dict[str, int] = {
        "PHOTO_TAMPERING": 30,
        "TEXT_TAMPERING": 25,
        "STAMP_TAMPERING": 25,
        "FACE_MISMATCH": 45,
        "FACE_VERIFICATION_SKIPPED": 35,
        "EXPIRED_DOCUMENT": 35,
        "CROSSFIELD_MISMATCH": 40,
        "WATCHLIST_HIT": 50,
        "METADATA_TAMPERING": 15,
        "MRZ_CHECKSUM_FAILURE": 20
    }
    
    # Risk Score Classification Thresholds
    RISK_LOW_CEILING: int = 29
    RISK_MEDIUM_CEILING: int = 69
    # >= 70 is CRITICAL / HIGH RISK

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()
