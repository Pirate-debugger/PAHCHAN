from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
if settings.RESOLVED_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.RESOLVED_DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_schema_compatibility():
    """Ensure newly added columns exist in existing SQLite databases."""
    if not settings.RESOLVED_DATABASE_URL.startswith("sqlite"):
        return
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(forensic_findings)"))
            existing_cols = {row[1] for row in result.fetchall()}
            if existing_cols:
                if "confidence" not in existing_cols:
                    conn.execute(text("ALTER TABLE forensic_findings ADD COLUMN confidence FLOAT DEFAULT 0.90"))
                if "recommended_action" not in existing_cols:
                    conn.execute(text("ALTER TABLE forensic_findings ADD COLUMN recommended_action VARCHAR(128) DEFAULT 'SECONDARY_REVIEW'"))
                if "requires_manual_review" not in existing_cols:
                    conn.execute(text("ALTER TABLE forensic_findings ADD COLUMN requires_manual_review BOOLEAN DEFAULT 1"))
            conn.commit()
        except Exception:
            pass
