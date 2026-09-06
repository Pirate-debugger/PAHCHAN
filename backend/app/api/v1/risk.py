"""
PAHCHAN Risk Engine Configuration & Assessment API
"""

from fastapi import APIRouter, Body
from typing import Dict, Any, Optional
from app.core.config import settings
from app.services.risk_service import calculate_screening_risk

router = APIRouter()

@router.post("/risk/assess")
async def assess_risk_endpoint(
    photo_replaced: bool = Body(False),
    text_manipulated: bool = Body(False),
    stamp_forged: bool = Body(False),
    face_mismatch: bool = Body(False),
    is_expired: bool = Body(False),
    crossfield_mismatch: bool = Body(False),
    watchlist_hit: bool = Body(False),
    metadata_tampered: bool = Body(False),
    mrz_pass: bool = Body(True),
    custom_weights: Optional[Dict[str, int]] = Body(None)
):
    """Calculates additive explainable risk score and decision recommendation."""
    res = calculate_screening_risk(
        photo_replaced=photo_replaced,
        text_manipulated=text_manipulated,
        stamp_forged=stamp_forged,
        face_mismatch=face_mismatch,
        is_expired=is_expired,
        crossfield_mismatch=crossfield_mismatch,
        watchlist_hit=watchlist_hit,
        metadata_tampered=metadata_tampered,
        mrz_pass=mrz_pass,
        custom_weights=custom_weights
    )
    return res

@router.get("/risk/weights")
async def get_risk_weights():
    """Returns active scoring weights."""
    return {
        "weights": settings.DEFAULT_RISK_WEIGHTS,
        "thresholds": {
            "low_risk_max": settings.RISK_LOW_CEILING,
            "medium_risk_max": settings.RISK_MEDIUM_CEILING,
            "critical_risk_min": settings.RISK_MEDIUM_CEILING + 1
        },
        "disclaimer": "Scoring weights are calibrated for decision-support and do not claim official statutory standard."
    }

@router.put("/risk/weights")
async def update_risk_weights(new_weights: Dict[str, int]):
    """Updates in-memory risk scoring weights."""
    for k, v in new_weights.items():
        if k in settings.DEFAULT_RISK_WEIGHTS and isinstance(v, int):
            settings.DEFAULT_RISK_WEIGHTS[k] = max(0, min(100, v))
    return {
        "status": "UPDATED",
        "weights": settings.DEFAULT_RISK_WEIGHTS
    }
