"""
PAHCHAN Watchlist API Endpoints (P1.3)
Exposes local intelligence database query and suspect bulletin management.
"""

from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.core.security import get_authenticated_operator, AuthenticatedOperator
from app.services.watchlist_service import (
    list_watchlist_entries,
    search_watchlist,
    add_watchlist_entry
)

router = APIRouter()

@router.get("/watchlist")
async def get_all_watchlist_records(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieves all active local intelligence watchlist bulletins."""
    records = list_watchlist_entries(db, limit=limit)
    return {
        "count": len(records),
        "records": records
    }

@router.get("/watchlist/search")
async def search_watchlist_endpoint(
    name: Optional[str] = Query(None),
    doc_number: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Checks passport holder name or document number against active intelligence bulletins."""
    res = search_watchlist(db, name=name, doc_number=doc_number)
    return res

@router.post("/watchlist")
async def create_watchlist_record(
    payload: Dict[str, Any] = Body(...),
    auth: AuthenticatedOperator = Depends(get_authenticated_operator),
    db: Session = Depends(get_db)
):
    """Creates a new suspect bulletin (requires API key authentication)."""
    if "full_name" not in payload or "doc_number" not in payload:
        raise HTTPException(status_code=400, detail="Missing required fields: full_name and doc_number.")
    
    record = add_watchlist_entry(db, payload)
    return {"status": "CREATED", "record": record}
