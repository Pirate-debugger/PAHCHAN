import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, engine, Base
from app.core.config import settings
from app.models.screening import (
    ScreeningSession,
    Document,
    ExtractedField,
    ValidationResult,
    ForensicFinding,
    FaceVerification,
    RiskAssessment,
    ScreeningDecision,
    AuditLogEntry
)
from app.services.demo_service import demo_service, DEMO_SCENARIOS
from app.api.screenings import run_screening_analysis

def seed_fresh_database():
    print("=========================================================")
    print("   PAHCHAN - Seeding Fresh Realistic Checkpoint Cases    ")
    print("=========================================================")
    
    # Re-create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing sessions
        print("Clearing old session records...")
        db.query(ScreeningDecision).delete()
        db.query(AuditLogEntry).delete()
        db.query(FaceVerification).delete()
        db.query(ForensicFinding).delete()
        db.query(ValidationResult).delete()
        db.query(ExtractedField).delete()
        db.query(RiskAssessment).delete()
        db.query(Document).delete()
        db.query(ScreeningSession).delete()
        db.commit()

        # Seed scenarios
        seed_configs = [
            ("scenario_1_genuine", "PH-1001", "COMPLETED", "CLEAR_PASS", "Verified authentic traveler presentation at Terminal 4."),
            ("scenario_2_altered_photo", "PH-1002", "IN_REVIEW", None, "Flagged at secondary lane for photo texture anomaly."),
            ("scenario_3_modified_dob", "PH-1003", "PENDING", None, "Automated OCR flagged MRZ check digit discrepancy."),
            ("scenario_4_face_mismatch", "PH-1004", "IN_REVIEW", None, "Facial divergence detected between passport photo and booth camera."),
            ("scenario_5_expired_document", "PH-1005", "PENDING", None, "Expired document presentation flagged by automated rule engine.")
        ]

        print("Seeding 5 fresh checkpoint cases...")
        for scenario_id, case_id, status, decision, officer_notes in seed_configs:
            scenario = demo_service.get_scenario_by_id(scenario_id)
            if not scenario:
                continue

            doc_rel, pres_rel = demo_service.generate_scenario_document(scenario)
            doc_file = doc_rel.split("/")[-1]
            pres_file = pres_rel.split("/")[-1]

            session = ScreeningSession(
                id=case_id,
                status="PENDING",
                document_type=scenario["document_type"],
                is_demo_scenario=True,
                demo_scenario_id=scenario["id"],
                officer_notes=officer_notes,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=15 * len(seed_configs))
            )
            db.add(session)
            db.commit()

            # Add documents
            d1 = Document(
                id=f"doc-{case_id}-primary",
                session_id=case_id,
                category="PRIMARY_DOCUMENT",
                filename=doc_file,
                file_path=str(settings.UPLOADS_DIR / doc_file),
                mime_type="image/jpeg",
                is_synthetic=True
            )
            d2 = Document(
                id=f"doc-{case_id}-presented",
                session_id=case_id,
                category="PRESENTED_PHOTO",
                filename=pres_file,
                file_path=str(settings.UPLOADS_DIR / pres_file),
                mime_type="image/jpeg",
                is_synthetic=True
            )
            db.add(d1)
            db.add(d2)
            db.commit()

            # Run full automated screening analysis
            run_screening_analysis(session_id=case_id, db=db)

            # Update final status & decision if specified
            sess = db.query(ScreeningSession).filter(ScreeningSession.id == case_id).first()
            if status == "COMPLETED" and decision:
                sess.status = "COMPLETED"
                dec = ScreeningDecision(
                    id=f"dec-{case_id}",
                    session_id=case_id,
                    decision=decision,
                    officer_id="SSB-OFFICER-7492",
                    officer_name="Inspector V. K. Sharma",
                    notes="Authentic document verified. Checksum and biometric match confirmed.",
                    decided_at=datetime.now(timezone.utc)
                )
                db.add(dec)
                db.commit()
            elif status == "IN_REVIEW":
                sess.status = "IN_REVIEW"
                db.commit()

            print(f"  + Seeded {case_id}: {scenario['title']} ({sess.status})")

        print("=========================================================")
        print("Fresh database seeding complete! 5 clean cases ready.")
        print("=========================================================")

    finally:
        db.close()

if __name__ == "__main__":
    seed_fresh_database()
