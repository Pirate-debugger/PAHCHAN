"""
PAHCHAN Demo Mode & Synthetic Scenarios API
Allows repeatable demonstration of all 8 SIH2026188 competition scenarios.
"""

from fastapi import APIRouter

router = APIRouter()

DEMO_SCENARIOS = [
    {
        "id": "scenario-1",
        "name": "Genuine Document",
        "description": "Pristine Republic of India passport presented by legitimate holder. Clean ELA, valid MRZ checksums, high biometric match.",
        "expected_risk_score": 6,
        "expected_risk_level": "LOW",
        "expected_decision": "CLEAR_ENTRY"
    },
    {
        "id": "scenario-2",
        "name": "Altered Photograph",
        "description": "Physical photo cut and replaced. Error Level Analysis indicates quantization divergence and Sobel edge discontinuity.",
        "expected_risk_score": 78,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    },
    {
        "id": "scenario-3",
        "name": "Modified DOB",
        "description": "Visual Inspection Zone (VIZ) altered from 2002 to 1995. Conflicts with cryptographic MRZ check digits.",
        "expected_risk_score": 82,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    },
    {
        "id": "scenario-4",
        "name": "Counterfeit Stamp",
        "description": "Immigration entry stamp shows structural similarity (SSIM: 38.4%) failure and synthetic inkjet ink color spectrum.",
        "expected_risk_score": 72,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    },
    {
        "id": "scenario-5",
        "name": "Face Mismatch",
        "description": "Lookalike presenter presents legitimate third-party passport. Biometric embedding distance triggers impersonation alert.",
        "expected_risk_score": 88,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    },
    {
        "id": "scenario-6",
        "name": "Expired Document + Photoshop Metadata",
        "description": "Document expired in 2023. EXIF metadata contains Adobe Photoshop 2024 modification history footprint.",
        "expected_risk_score": 85,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    },
    {
        "id": "scenario-7",
        "name": "Passport-Visa Mismatch",
        "description": "Passport issued to Rahul Kumar attached with visa sticker issued to Rahul Sharma. Cross-document identity conflict.",
        "expected_risk_score": 75,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "SECONDARY_INSPECTION"
    },
    {
        "id": "scenario-8",
        "name": "Multiple Risk Signals (Combined)",
        "description": "Combined attack: Spliced photograph + altered expiration date + biometric face mismatch + active intelligence bulletin match.",
        "expected_risk_score": 95,
        "expected_risk_level": "CRITICAL",
        "expected_decision": "DETAIN_ALERT"
    }
]

@router.get("/demo/scenarios")
async def list_demo_scenarios():
    """Lists all 8 deterministic SIH competition scenarios."""
    return {
        "count": len(DEMO_SCENARIOS),
        "scenarios": DEMO_SCENARIOS
    }
