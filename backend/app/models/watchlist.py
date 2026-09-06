"""
SQLAlchemy Model for Watchlist & Flagged Identity Records (P1.3)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.database import Base

class WatchlistEntryModel(Base):
    __tablename__ = "watchlist_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    watchlist_id = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(255), index=True, nullable=False)
    doc_number = Column(String(64), index=True, nullable=False)
    nationality = Column(String(64), default="IND", nullable=False)
    dob = Column(String(32), default="1990-01-01", nullable=True)
    risk_category = Column(String(64), default="TERRORISM", nullable=False)
    flagged_by = Column(String(128), default="SSB Intelligence", nullable=False)
    severity = Column(String(32), default="CRITICAL", nullable=False)
    alert_notes = Column(Text, nullable=False)
    date_added = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    photo_url = Column(String(255), nullable=True)
