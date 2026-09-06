"""
PAHCHAN API v1 Master Router
"""

from fastapi import APIRouter
from app.api.v1.screenings import router as screenings_router
from app.api.v1.documents import router as documents_router
from app.api.v1.face import router as face_router
from app.api.v1.risk import router as risk_router
from app.api.v1.audit import router as audit_router
from app.api.v1.demo import router as demo_router
from app.api.v1.watchlist import router as watchlist_router

api_router = APIRouter()

api_router.include_router(screenings_router, tags=["Screening Pipeline"])
api_router.include_router(documents_router, tags=["Document Processing & Forensics"])
api_router.include_router(face_router, tags=["Biometric Face Verification"])
api_router.include_router(risk_router, tags=["Risk Engine & Weights"])
api_router.include_router(audit_router, tags=["Audit Trail & History"])
api_router.include_router(demo_router, tags=["Demo Mode & Synthetic Lab"])
api_router.include_router(watchlist_router, tags=["Watchlist & Intelligence"])
