import pytest
from app.services.providers.registry import provider_registry
from app.services.providers.pan_provider import pan_provider
from app.services.providers.passport_provider import passport_provider

def test_provider_registry_resolution():
    pan_providers = provider_registry.resolve_provider_for_document("PAN")
    assert len(pan_providers) > 0
    assert pan_providers[0].provider_id == "pan_provider"

    passport_providers = provider_registry.resolve_provider_for_document("PASSPORT")
    assert len(passport_providers) > 0
    assert passport_providers[0].provider_id == "passport_provider"

def test_pan_provider_syntax_and_entity():
    # Valid syntax, individual (P), surname initial (S)
    res = pan_provider.verify_document("PAN", "ABCPS1234F", {"full_name": "ROHIT SHARMA"})
    assert res.status in ["VERIFIED", "UNVERIFIABLE"]
    assert res.response_metadata.get("entity_type") == "Individual"
    assert res.response_metadata.get("surname_initial") == "S"

    # Invalid syntax (missing letters)
    res_invalid = pan_provider.verify_document("PAN", "1234567890", {"full_name": "TEST USER"})
    assert res_invalid.status == "MISMATCH"
    assert res_invalid.is_matched is False

def test_passport_stolen_alert_in_demo():
    # J8392018 is registered in the demonstration stolen passport blacklist
    res = passport_provider.verify_document("PASSPORT", "J8392018", {"full_name": "WANTED SUSPECT"})
    assert res.status == "MISMATCH"
    assert res.is_matched is False
    assert "SLTD" in res.evidence_notes or "stolen" in res.evidence_notes.lower()
