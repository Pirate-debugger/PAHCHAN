"""
PAHCHAN Audit Service
Persists immutable screening records with SHA-256 document signatures into the relational database.
"""

import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.audit import AuditLogModel

def record_audit_event(
    db: Session,
    session_id: str,
    action: str,
    document_sha256: str,
    operator_id: str,
    checkpoint: str,
    total_risk_score: int,
    risk_level: str,
    decision: str,
    event_details: Dict[str, Any]
) -> AuditLogModel:
    """Creates an immutable audit log record in the database."""
    log_entry = AuditLogModel(
        session_id=session_id,
        timestamp=datetime.now(timezone.utc),
        operator_id=operator_id,
        checkpoint=checkpoint,
        action=action,
        document_sha256=document_sha256,
        total_risk_score=total_risk_score,
        risk_level=risk_level,
        decision=decision,
        event_details_json=json.dumps(event_details)
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_audit_logs(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves chronological audit log entries."""
    rows = db.query(AuditLogModel).order_by(AuditLogModel.id.desc()).limit(limit).all()
    results = []
    for r in rows:
        details = {}
        if r.event_details_json:
            try:
                details = json.loads(r.event_details_json)
            except Exception:
                pass
        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if r.timestamp else "",
            "operator_id": r.operator_id,
            "checkpoint": r.checkpoint,
            "action": r.action,
            "document_sha256": r.document_sha256,
            "total_risk_score": r.total_risk_score,
            "risk_level": r.risk_level,
            "decision": r.decision,
            "details": details
        })
    return results
