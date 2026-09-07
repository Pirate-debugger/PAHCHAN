import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.screening import (
    ScreeningSession,
    Document,
    generate_case_id
)
from app.schemas.screening import DemoScenarioSummary, ScreeningSessionDetail
from app.services.demo_service import demo_service, DEMO_SCENARIOS
from app.services.audit_service import AuditService
from app.api.screenings import run_screening_analysis

router = APIRouter(prefix="/demo", tags=["Demo Lab"])

@router.get("/scenarios", response_model=List[DemoScenarioSummary])
def list_demo_scenarios():
    """List the 8 pre-configured synthetic SIH demonstration scenarios"""
    scenarios = demo_service.get_all_scenarios()
    results = []
    for s in scenarios:
        results.append(DemoScenarioSummary(
            id=s["id"],
            title=s["title"],
            scenario_type=s["scenario_type"],
            description=s["description"],
            expected_risk_level=s["expected_risk_level"],
            primary_anomaly=s["primary_anomaly"],
            document_type=s["document_type"]
        ))
    return results

@router.post("/scenarios/{scenario_id}/load", response_model=ScreeningSessionDetail)
def load_demo_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """
    Instantly create and analyze a deterministic synthetic scenario case.
    SIH evaluators can run this with 1 click to test genuine and tampered scenarios.
    """
    scenario = demo_service.get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Demo scenario not found")

    # Generate or get synthetic document and presented images
    doc_rel_url, pres_rel_url = demo_service.generate_scenario_document(scenario)

    doc_filename = doc_rel_url.split("/")[-1]
    pres_filename = pres_rel_url.split("/")[-1]

    doc_abs_path = str(settings.UPLOADS_DIR / doc_filename)
    pres_abs_path = str(settings.UPLOADS_DIR / pres_filename)

    case_id = generate_case_id()
    while db.query(ScreeningSession).filter(ScreeningSession.id == case_id).first():
        case_id = generate_case_id()

    session = ScreeningSession(
        id=case_id,
        status="PENDING",
        document_type=scenario["document_type"],
        is_demo_scenario=True,
        demo_scenario_id=scenario["id"],
        officer_notes=f"Synthetic demonstration case loaded: {scenario['title']}"
    )
    db.add(session)
    db.commit()

    # Create primary document record
    doc = Document(
        id=str(uuid.uuid4()),
        session_id=case_id,
        category="PRIMARY_DOCUMENT",
        filename=doc_filename,
        file_path=doc_abs_path,
        mime_type="image/jpeg",
        is_synthetic=True
    )
    db.add(doc)

    # Create presented photo record
    pres = Document(
        id=str(uuid.uuid4()),
        session_id=case_id,
        category="PRESENTED_PHOTO",
        filename=pres_filename,
        file_path=pres_abs_path,
        mime_type="image/jpeg",
        is_synthetic=True
    )
    db.add(pres)
    db.commit()

    AuditService.log(
        db=db,
        session_id=case_id,
        actor="DEMO-SYSTEM",
        action="DEMO_SCENARIO_LOADED",
        details=f"Synthetic scenario '{scenario['title']}' loaded for evaluation"
    )

    # Run full automated analysis pipeline
    flags_json = json.dumps(scenario.get("flags", {}))
    face_outcome = scenario.get("face_match", "MATCH")

    return run_screening_analysis(
        session_id=case_id,
        force_scenario_flags=flags_json,
        force_face_outcome=face_outcome,
        db=db
    )
