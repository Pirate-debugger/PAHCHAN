"""
PAHCHAN Audit Service
Persists immutable screening records with SHA-256 document signatures into the relational database.
Features cryptographic hash-chaining (P1.5) to provide tamper-evident verification.
"""

import json
import hashlib
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.audit import AuditLogModel

GENESIS_PREV_HASH = "0" * 64

def compute_record_hash(
    prev_hash: str,
    session_id: str,
    timestamp_str: str,
    operator_id: str,
    checkpoint: str,
    action: str,
    document_sha256: str,
    total_risk_score: int,
    risk_level: str,
    decision: str,
    event_details_json: str
) -> str:
    """Computes SHA-256 hash chaining previous row hash and current row data."""
    payload = (
        f"{prev_hash}|{session_id}|{timestamp_str}|{operator_id}|"
        f"{checkpoint}|{action}|{document_sha256}|{total_risk_score}|"
        f"{risk_level}|{decision}|{event_details_json}"
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

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
    """
    Creates a cryptographically chained audit log record in the database.
    Each record binds to the record_hash of the preceding record.
    """
    last_entry = db.query(AuditLogModel).order_by(AuditLogModel.id.desc()).first()
    prev_hash = last_entry.record_hash if (last_entry and last_entry.record_hash) else GENESIS_PREV_HASH

    now_utc = datetime.now(timezone.utc)
    timestamp_str = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")
    details_json = json.dumps(event_details, sort_keys=True)

    rec_hash = compute_record_hash(
        prev_hash=prev_hash,
        session_id=session_id,
        timestamp_str=timestamp_str,
        operator_id=operator_id,
        checkpoint=checkpoint,
        action=action,
        document_sha256=document_sha256,
        total_risk_score=total_risk_score,
        risk_level=risk_level,
        decision=decision,
        event_details_json=details_json
    )

    log_entry = AuditLogModel(
        session_id=session_id,
        timestamp=now_utc,
        operator_id=operator_id,
        checkpoint=checkpoint,
        action=action,
        document_sha256=document_sha256,
        total_risk_score=total_risk_score,
        risk_level=risk_level,
        decision=decision,
        event_details_json=details_json,
        previous_hash=prev_hash,
        record_hash=rec_hash
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_audit_logs(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves chronological audit log entries with cryptographic hash proofs."""
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
            "previous_hash": r.previous_hash or GENESIS_PREV_HASH,
            "record_hash": r.record_hash or "",
            "details": details
        })
    return results

def verify_audit_chain(db: Session) -> Dict[str, Any]:
    """
    P1.5: Cryptographically verifies the audit trail hash-chain ledger.
    Walks all rows in chronological sequence (id ASC) and verifies:
    1. Each row's previous_hash matches the previous row's record_hash.
    2. Each row's record_hash matches the SHA-256 computation of its contents.
    Detects any deletion, reordering, or field tampering.
    """
    entries = db.query(AuditLogModel).order_by(AuditLogModel.id.asc()).all()
    if not entries:
        return {
            "valid": True,
            "total_records": 0,
            "tampered": False,
            "chain_head": None,
            "message": "Audit ledger is empty."
        }

    expected_prev_hash = GENESIS_PREV_HASH

    for entry in entries:
        # If record_hash was empty (legacy pre-migration row), populate or skip
        if not entry.record_hash:
            continue

        # 1. Chain continuity check
        if entry.previous_hash != expected_prev_hash:
            return {
                "valid": False,
                "tampered": True,
                "tampered_id": entry.id,
                "tampered_session": entry.session_id,
                "reason": (
                    f"Broken hash chain link at record #{entry.id}: "
                    f"previous_hash '{entry.previous_hash[:12]}...' != expected '{expected_prev_hash[:12]}...'"
                )
            }

        # 2. Recompute content hash
        timestamp_str = entry.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if entry.timestamp else ""
        computed_hash = compute_record_hash(
            prev_hash=entry.previous_hash,
            session_id=entry.session_id,
            timestamp_str=timestamp_str,
            operator_id=entry.operator_id,
            checkpoint=entry.checkpoint,
            action=entry.action,
            document_sha256=entry.document_sha256,
            total_risk_score=entry.total_risk_score,
            risk_level=entry.risk_level,
            decision=entry.decision,
            event_details_json=entry.event_details_json or "{}"
        )

        if entry.record_hash != computed_hash:
            return {
                "valid": False,
                "tampered": True,
                "tampered_id": entry.id,
                "tampered_session": entry.session_id,
                "reason": (
                    f"Cryptographic hash mismatch at record #{entry.id}: "
                    f"record content has been altered."
                )
            }

        expected_prev_hash = entry.record_hash

    return {
        "valid": True,
        "total_records": len(entries),
        "tampered": False,
        "chain_head": entries[-1].record_hash,
        "message": f"Cryptographic audit chain verified ({len(entries)} records intact)."
    }

