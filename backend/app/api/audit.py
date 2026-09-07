from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.screening import AuditLogEntry
from app.schemas.screening import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_trail(
    session_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve chronological audit trail entries for chain-of-custody tracking"""
    query = db.query(AuditLogEntry)

    if session_id:
        query = query.filter(AuditLogEntry.session_id == session_id)
    if action:
        query = query.filter(AuditLogEntry.action == action)

    logs = query.order_by(desc(AuditLogEntry.timestamp)).limit(limit).all()
    return logs
