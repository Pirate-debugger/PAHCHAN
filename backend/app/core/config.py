import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PAHCHAN — AI Fake Identity & Document Screening System"
    VERSION: str = "1.0.0"
    ORGANIZATION: str = "Ministry of Home Affairs / Sashastra Seema Bal (SSB)"
    DEPARTMENT: str = "Police II Division"
    SIH_PROBLEM_ID: str = "SIH2026188"
    API_V1_STR: str = "/api"
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STATIC_DIR: Path = BASE_DIR / "static"
    UPLOADS_DIR: Path = STATIC_DIR / "uploads"
    EVIDENCE_DIR: Path = STATIC_DIR / "evidence"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pahchan.db")
    
    # Risk Engine Default Thresholds (Configurable)
    RISK_THRESHOLD_LOW: int = 29
    RISK_THRESHOLD_REVIEW: int = 59
    RISK_THRESHOLD_HIGH: int = 79
    # Anything 80+ is CRITICAL
    
    # Quality Guard Thresholds
    MIN_FACE_SHARPNESS_VAR: float = 35.0  # Laplacian variance threshold
    MIN_FACE_CONFIDENCE: float = 0.60
    
    # Verification Sources Configuration
    ENABLE_DEMO_WATCHLIST: bool = True
    DEMO_WATCHLIST_NAME: str = "Demonstration Verification Source"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

# Ensure static directories exist
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
