"""
PAHCHAN: AI-Powered Fake Identity & Document Screening Platform
Smart India Hackathon 2026 — Problem Statement SIH2026188
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.database import init_database
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database and tables upon server boot."""
    init_database()
    yield

app = FastAPI(
    title=f"{settings.PROJECT_NAME} — Intelligent Identity & Document Screening Platform",
    description=(
        "AI-Assisted Decision-Support and Forensic Screening Workstation for Authorized "
        "Border/Checkpoint Officers (SSB / Bureau of Immigration / Ministry of Home Affairs). "
        "Transforms complex multi-signal forensic evidence into explainable risk indicators."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Screening Pipeline", "description": "Core end-to-end multi-layer screening workflow"},
        {"name": "Document Processing & Forensics", "description": "Error Level Analysis, Sobel gradients, OCR & MRZ validation"},
        {"name": "Biometric Face Verification", "description": "Presenter vs portrait biometric verification with landmark HUD"},
        {"name": "Risk Engine & Weights", "description": "Deterministic additive scoring and configurable factor weights"},
        {"name": "Audit Trail & History", "description": "Immutable screening logs with cryptographic SHA-256 signatures"},
        {"name": "Demo Mode & Synthetic Lab", "description": "Pre-configured competition demonstration scenarios"}
    ]
)

# Configure Cross-Origin Resource Sharing (CORS) for Vite / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["System Health"])
@app.get("/api/v1/health", tags=["System Health"])
def health_check():
    """Health check endpoint confirming engine readiness."""
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "mode": "DECISION_SUPPORT_ACTIVE",
        "checkpoint": "Raxaul Land Border Checkpoint (Indo-Nepal)",
        "agency": "Special Service Bureau (SSB) / MHA"
    }

# Mount master v1 API router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
