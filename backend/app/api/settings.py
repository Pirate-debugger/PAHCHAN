from fastapi import APIRouter
from app.core.config import settings
from app.schemas.screening import SystemSettingsSchema

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("", response_model=SystemSettingsSchema)
def get_system_settings():
    """Retrieve system screening parameters, thresholds, and verification sources"""
    return SystemSettingsSchema(
        risk_threshold_low=settings.RISK_THRESHOLD_LOW,
        risk_threshold_review=settings.RISK_THRESHOLD_REVIEW,
        risk_threshold_high=settings.RISK_THRESHOLD_HIGH,
        enable_demo_watchlist=settings.ENABLE_DEMO_WATCHLIST,
        demo_watchlist_name=settings.DEMO_WATCHLIST_NAME,
        ocr_engine="EasyOCR + ICAO Doc 9303 MRZ Engine",
        face_quality_threshold=settings.MIN_FACE_SHARPNESS_VAR
    )

@router.put("", response_model=SystemSettingsSchema)
def update_system_settings(new_settings: SystemSettingsSchema):
    """Update screening thresholds and dataset toggles"""
    settings.RISK_THRESHOLD_LOW = new_settings.risk_threshold_low
    settings.RISK_THRESHOLD_REVIEW = new_settings.risk_threshold_review
    settings.RISK_THRESHOLD_HIGH = new_settings.risk_threshold_high
    settings.ENABLE_DEMO_WATCHLIST = new_settings.enable_demo_watchlist
    settings.DEMO_WATCHLIST_NAME = new_settings.demo_watchlist_name
    settings.MIN_FACE_SHARPNESS_VAR = new_settings.face_quality_threshold
    return new_settings
