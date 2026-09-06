"""
PAHCHAN Watchlist & Intelligence Bulletin Service (P1.3)
Performs local database lookup for flagged travel credentials using exact doc_number
and fuzzy name matching (RapidFuzz).
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from rapidfuzz import fuzz

from app.models.watchlist import WatchlistEntryModel

DEMO_WATCHLIST_ENTRIES = [
    {
        "watchlist_id": "W-INT-2026-081",
        "full_name": "VIKRAM SINGH MALHOTRA",
        "doc_number": "T9482104",
        "nationality": "IND",
        "dob": "1984-06-12",
        "risk_category": "HUMAN_TRAFFICKING",
        "flagged_by": "SSB Intelligence",
        "severity": "CRITICAL",
        "alert_notes": "Active INTERPOL diffusion for regional cross-border document smuggling operation.",
        "photo_url": "/demo/avatars/suspect1.jpg"
    },
    {
        "watchlist_id": "W-MHA-2025-412",
        "full_name": "TARIQ AHMED DAR",
        "doc_number": "P8372019",
        "nationality": "IND",
        "dob": "1989-11-23",
        "risk_category": "TERRORISM",
        "flagged_by": "MHA Bureau of Immigration",
        "severity": "CRITICAL",
        "alert_notes": "Red alert: Lookout circular issued by National Investigation Agency (NIA).",
        "photo_url": "/demo/avatars/suspect2.jpg"
    },
    {
        "watchlist_id": "W-INT-2026-104",
        "full_name": "PRIYA SHARMA",
        "doc_number": "L4920192",
        "nationality": "IND",
        "dob": "1992-03-15",
        "risk_category": "FINANCIAL_CRIME",
        "flagged_by": "INTERPOL",
        "severity": "HIGH",
        "alert_notes": "Interpol Blue Notice: Wanted for non-bailable fraud warrant.",
        "photo_url": "/demo/avatars/suspect3.jpg"
    },
    {
        "watchlist_id": "W-SSB-2026-019",
        "full_name": "RAJESH KUMAR VERMA",
        "doc_number": "Z9919203",
        "nationality": "IND",
        "dob": "1986-09-04",
        "risk_category": "IMMIGRATION_VIOLATION",
        "flagged_by": "State Police CID",
        "severity": "HIGH",
        "alert_notes": "Subject of recurring entry tampering bulletin along Raxaul land border corridor.",
        "photo_url": "/demo/avatars/suspect4.jpg"
    }
]

def seed_default_watchlist(db: Session) -> int:
    """Seeds demo entries if table is empty."""
    count = db.query(WatchlistEntryModel).count()
    if count > 0:
        return count

    for item in DEMO_WATCHLIST_ENTRIES:
        entry = WatchlistEntryModel(
            watchlist_id=item["watchlist_id"],
            full_name=item["full_name"],
            doc_number=item["doc_number"],
            nationality=item.get("nationality", "IND"),
            dob=item.get("dob", "1990-01-01"),
            risk_category=item.get("risk_category", "IMMIGRATION_VIOLATION"),
            flagged_by=item.get("flagged_by", "SSB Intelligence"),
            severity=item.get("severity", "CRITICAL"),
            alert_notes=item["alert_notes"],
            date_added=datetime.now(timezone.utc),
            photo_url=item.get("photo_url")
        )
        db.add(entry)
    db.commit()
    return len(DEMO_WATCHLIST_ENTRIES)

def list_watchlist_entries(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """Returns all watchlist entries."""
    seed_default_watchlist(db)
    records = db.query(WatchlistEntryModel).order_by(WatchlistEntryModel.id.desc()).limit(limit).all()
    out = []
    for r in records:
        out.append({
            "id": r.watchlist_id,
            "fullName": r.full_name,
            "docNumber": r.doc_number,
            "nationality": r.nationality,
            "dob": r.dob,
            "riskCategory": r.risk_category,
            "flaggedBy": r.flagged_by,
            "severity": r.severity,
            "alertNotes": r.alert_notes,
            "dateAdded": r.date_added.strftime("%Y-%m-%d") if r.date_added else "",
            "photoUrl": r.photo_url
        })
    return out

def add_watchlist_entry(db: Session, data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new watchlist entry into the local database."""
    wid = data.get("watchlist_id") or f"W-SSB-{uuid.uuid4().hex[:6].upper()}"
    entry = WatchlistEntryModel(
        watchlist_id=wid,
        full_name=data["full_name"].strip().upper(),
        doc_number=data["doc_number"].strip().upper(),
        nationality=data.get("nationality", "IND").strip().upper(),
        dob=data.get("dob", "1990-01-01"),
        risk_category=data.get("risk_category", "IMMIGRATION_VIOLATION"),
        flagged_by=data.get("flagged_by", "SSB Intelligence"),
        severity=data.get("severity", "CRITICAL"),
        alert_notes=data.get("alert_notes", "Flagged by checkpoint intelligence."),
        date_added=datetime.now(timezone.utc),
        photo_url=data.get("photo_url")
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.watchlist_id,
        "fullName": entry.full_name,
        "full_name": entry.full_name,
        "docNumber": entry.doc_number,
        "doc_number": entry.doc_number,
        "nationality": entry.nationality,
        "riskCategory": entry.risk_category,
        "severity": entry.severity,
        "alertNotes": entry.alert_notes
    }

def search_watchlist(
    db: Session,
    name: Optional[str] = None,
    doc_number: Optional[str] = None,
    name_threshold: float = 80.0
) -> Dict[str, Any]:
    """
    P1.3: Real local watchlist lookup.
    Checks exact document number and fuzzy name match using RapidFuzz.
    """
    seed_default_watchlist(db)
    
    clean_name = (name or "").strip().upper()
    clean_doc = (doc_number or "").strip().upper()

    all_entries = db.query(WatchlistEntryModel).all()

    # 1. Exact document number lookup (highest confidence)
    if clean_doc:
        for entry in all_entries:
            if entry.doc_number.strip().upper() == clean_doc:
                rec = {
                    "id": entry.watchlist_id,
                    "fullName": entry.full_name,
                    "full_name": entry.full_name,
                    "docNumber": entry.doc_number,
                    "doc_number": entry.doc_number,
                    "nationality": entry.nationality,
                    "dob": entry.dob,
                    "riskCategory": entry.risk_category,
                    "flaggedBy": entry.flagged_by,
                    "severity": entry.severity,
                    "alertNotes": entry.alert_notes,
                    "dateAdded": entry.date_added.strftime("%Y-%m-%d") if entry.date_added else "",
                    "match_type": "EXACT_DOC_NUMBER",
                    "confidence": 1.0
                }
                return {
                    "hit": True,
                    "match_type": "EXACT_DOC_NUMBER",
                    "confidence": 1.0,
                    "record": rec,
                    "matches": [rec]
                }

    # 2. Fuzzy name lookup
    if clean_name and len(clean_name) >= 4:
        best_match = None
        best_score = 0.0

        for entry in all_entries:
            # Use max of token_sort_ratio and token_set_ratio for name permutations
            sort_ratio = fuzz.token_sort_ratio(clean_name, entry.full_name.upper())
            set_ratio = fuzz.token_set_ratio(clean_name, entry.full_name.upper())
            ratio = max(sort_ratio, set_ratio)

            if ratio > best_score:
                best_score = ratio
                best_match = entry

        if best_match and best_score >= name_threshold:
            conf = round(best_score / 100.0, 2)
            rec = {
                "id": best_match.watchlist_id,
                "fullName": best_match.full_name,
                "full_name": best_match.full_name,
                "docNumber": best_match.doc_number,
                "doc_number": best_match.doc_number,
                "nationality": best_match.nationality,
                "dob": best_match.dob,
                "riskCategory": best_match.risk_category,
                "flaggedBy": best_match.flagged_by,
                "severity": best_match.severity,
                "alertNotes": best_match.alert_notes,
                "dateAdded": best_match.date_added.strftime("%Y-%m-%d") if best_match.date_added else "",
                "match_type": f"FUZZY_NAME_MATCH_{int(best_score)}%",
                "confidence": conf
            }
            return {
                "hit": True,
                "match_type": f"FUZZY_NAME_MATCH_{int(best_score)}%",
                "confidence": conf,
                "record": rec,
                "matches": [rec]
            }

    return {"hit": False, "record": None, "matches": []}
