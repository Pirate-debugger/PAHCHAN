"""
PAHCHAN Audit Log API Endpoints
"""

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.services.audit_service import get_audit_logs, record_audit_event

router = APIRouter()

@router.get("/audit/logs")
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieves immutable audit trail entries."""
    logs = get_audit_logs(db, limit=limit)
    return {
        "count": len(logs),
        "logs": logs
    }

@router.post("/audit/record")
async def create_manual_audit_record(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Persists a screening event or officer override into the audit trail."""
    record = record_audit_event(
        db=db,
        session_id=payload.get("session_id", "MANUAL-EVENT"),
        action=payload.get("action", "OFFICER_ACTION"),
        document_sha256=payload.get("document_sha256", "N/A"),
        operator_id=payload.get("operator_id", "OFFICER-SSB-449"),
        checkpoint=payload.get("checkpoint", "Raxaul Checkpoint"),
        total_risk_score=payload.get("total_risk_score", 0),
        risk_level=payload.get("risk_level", "LOW"),
        decision=payload.get("decision", "CLEAR_ENTRY"),
        event_details=payload.get("details", {})
    )
    return {"saved": True, "id": record.id}
