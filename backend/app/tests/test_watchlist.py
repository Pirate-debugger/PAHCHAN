"""
Unit & Integration Tests for Watchlist Matching & Intelligence Database (P1.3)
Verifies exact document match, fuzzy name matching (RapidFuzz), API endpoints,
and authentication gating on watchlist insertion.
"""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.database import SessionLocal, init_database
from app.services.watchlist_service import (
    seed_default_watchlist,
    search_watchlist,
    list_watchlist_entries,
    add_watchlist_entry
)

client = TestClient(app)
VALID_KEY_HEADER = {"X-API-Key": settings.API_KEY}
INVALID_KEY_HEADER = {"X-API-Key": "invalid-key"}

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_database()
    db = SessionLocal()
    seed_default_watchlist(db)
    db.close()

def test_watchlist_exact_doc_number_match():
    """Exact document number in watchlist triggers CRITICAL match."""
    db = SessionLocal()
    try:
        # T9482104 is seeded (VIKRAM SINGH MALHOTRA)
        res = search_watchlist(db, name="ANY NAME", doc_number="T9482104")
        assert res["hit"] is True
        assert len(res["matches"]) > 0
        match = res["matches"][0]
        assert match["doc_number"] == "T9482104"
        assert match["match_type"] == "EXACT_DOC_NUMBER"
        assert match["confidence"] == 1.0
    finally:
        db.close()

def test_watchlist_fuzzy_name_match():
    """Fuzzy name match flags suspect with high similarity score."""
    db = SessionLocal()
    try:
        # Seeded: TARIQ AHMED DAR
        res = search_watchlist(db, name="TARIQ AHMED", doc_number="UNFLAGGED123")
        assert res["hit"] is True
        assert len(res["matches"]) > 0
        match = res["matches"][0]
        assert "TARIQ" in match["full_name"]
        assert "FUZZY_NAME" in match["match_type"]
        assert match["confidence"] >= 0.85
    finally:
        db.close()

def test_watchlist_clean_subject_no_hit():
    """Clean unflagged passport and name returns hit=False."""
    db = SessionLocal()
    try:
        res = search_watchlist(db, name="JANE CLEAN TRAVELER", doc_number="K9999999")
        assert res["hit"] is False
        assert len(res["matches"]) == 0
    finally:
        db.close()

def test_watchlist_api_endpoints_and_auth():
    """Test GET /watchlist, GET /watchlist/search, and POST /watchlist."""
    # 1. GET /watchlist returns records
    res_list = client.get("/api/v1/watchlist")
    assert res_list.status_code == 200
    data = res_list.json()
    assert "records" in data
    assert data["count"] >= 4

    # 2. GET /watchlist/search with doc_number query
    res_search = client.get("/api/v1/watchlist/search?doc_number=T9482104")
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert search_data["hit"] is True

    # 3. POST /watchlist without auth -> 401
    new_suspect = {
        "full_name": "TEST SUSPECT ENTRY",
        "doc_number": "X8888888",
        "nationality": "IND",
        "risk_category": "TERRORISM",
        "alert_notes": "Test bulletin insertion"
    }
    res_unauth = client.post("/api/v1/watchlist", json=new_suspect)
    assert res_unauth.status_code == 401

    # 4. POST /watchlist with auth -> 200 CREATED
    res_auth = client.post("/api/v1/watchlist", headers=VALID_KEY_HEADER, json=new_suspect)
    assert res_auth.status_code == 200
    post_data = res_auth.json()
    assert post_data["status"] == "CREATED"
    assert post_data["record"]["doc_number"] == "X8888888"

    # 5. Verify search now finds newly added suspect
    res_verify = client.get("/api/v1/watchlist/search?doc_number=X8888888")
    assert res_verify.status_code == 200
    assert res_verify.json()["hit"] is True
