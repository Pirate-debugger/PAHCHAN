"""
PAHCHAN Database Management & Session Factory
Uses SQLite for zero-dependency local demonstration with SQLAlchemy models.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings
import os

# Ensure directory exists for SQLite database
db_dir = os.path.dirname(settings.SQLITE_DB_PATH)
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{settings.SQLITE_DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Creates all database tables."""
    import app.models.screening  # noqa: F401
    import app.models.audit      # noqa: F401
    Base.metadata.create_all(bind=engine)

# Ensure tables exist immediately upon database module import
init_database()
