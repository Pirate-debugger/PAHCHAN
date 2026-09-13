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

    @property
    def RESOLVED_DATABASE_URL(self) -> str:
        if self.DATABASE_URL == "sqlite:///./pahchan.db":
            return f"sqlite:///{str(self.BASE_DIR / 'pahchan.db')}"
        return self.DATABASE_URL
    
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

    # CORS Configuration
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # Upload Constraints & Security
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp", ".pdf"]

    # Provider Execution Mode
    ALLOW_DEMO_PROVIDERS: bool = True

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

# Ensure static directories exist
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
