import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.screening import AuditLogEntry

class AuditService:
    @staticmethod
    def log(
        db: Session,
        session_id: str,
        action: str,
        details: str = None,
        actor: str = "SSB-OFFICER-4821",
        ip_address: str = "127.0.0.1"
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc),
            session_id=session_id,
            actor=actor,
            action=action,
            details=details,
            ip_address=ip_address
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
