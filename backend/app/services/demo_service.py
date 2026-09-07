import os
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, Any, List, Tuple
from app.core.config import settings

# 8 Deterministic Scenarios
DEMO_SCENARIOS = [
    {
        "id": "scenario_1_genuine",
        "title": "Genuine Passport",
        "scenario_type": "GENUINE",
        "document_type": "PASSPORT",
        "description": "Standard authentic passport with valid ICAO 9303 MRZ, matching biometric portrait, and intact security substrate.",
        "expected_risk_level": "LOW",
        "primary_anomaly": "None (Clean Pass)",
        "fields": {
            "full_name": "ARJUN MEHTA",
            "document_number": "P8291047",
            "nationality": "IND",
            "date_of_birth": "1994-08-14",
            "date_of_expiry": "2032-08-13",
            "gender": "M"
        },
        "mrz_l1": "P<INDMEHTA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "P8291047<6IND9408148M3208139<<<<<<<<<<<<<<06",
        "flags": {},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_2_altered_photo",
        "title": "Altered Photograph (Photo Replacement)",
        "scenario_type": "TAMPERING",
        "document_type": "PASSPORT",
        "description": "Passport with a digitally spliced/replaced portrait. Demonstrates Error Level Analysis (ELA) and perimeter edge gradient discontinuity detection.",
        "expected_risk_level": "HIGH",
        "primary_anomaly": "Photo Replacement / Compression Discrepancy",
        "fields": {
            "full_name": "RAJESH SHARMA",
            "document_number": "Z4091823",
            "nationality": "IND",
            "date_of_birth": "1988-11-22",
            "date_of_expiry": "2030-11-21",
            "gender": "M"
        },
        "mrz_l1": "P<INDSHARMA<<RAJESH<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "Z4091823<4IND8811226M3011216<<<<<<<<<<<<<<08",
        "flags": {"altered_photo": True},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_3_modified_dob",
        "title": "Modified Date of Birth (MRZ Checksum Fail)",
        "scenario_type": "TAMPERING",
        "document_type": "PASSPORT",
        "description": "Visual Inspection Zone displays DOB as 1999, but MRZ check digit fails calculation and localized ELA reveals digit splicing.",
        "expected_risk_level": "HIGH",
        "primary_anomaly": "Modified DOB & MRZ 7-3-1 Checksum Failure",
        "fields": {
            "full_name": "SUNIL KUMAR",
            "document_number": "M1948203",
            "nationality": "IND",
            "date_of_birth": "1999-04-10",  # visual zone altered
            "date_of_expiry": "2031-04-09",
            "gender": "M"
        },
        # Tampered DOB: 990410 with mismatched check digit '9' instead of '1'
        "mrz_l1": "P<INDKUMAR<<SUNIL<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "M1948203<9IND9904109M3104098<<<<<<<<<<<<<<00",
        "flags": {"modified_dob": True},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_4_face_mismatch",
        "title": "Identity Impersonation (Face Mismatch)",
        "scenario_type": "IMPERSONATION",
        "document_type": "PASSPORT",
        "description": "Genuine passport presented by an impersonator. Facial comparison reveals significant biometric divergence between document portrait and live capture.",
        "expected_risk_level": "HIGH",
        "primary_anomaly": "Biometric Mismatch Signal",
        "fields": {
            "full_name": "DEEPAK PATEL",
            "document_number": "K7728109",
            "nationality": "IND",
            "date_of_birth": "1991-03-05",
            "date_of_expiry": "2029-03-04",
            "gender": "M"
        },
        "mrz_l1": "P<INDPATEL<<DEEPAK<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "K7728109<4IND9103052M2903046<<<<<<<<<<<<<<06",
        "flags": {},
        "face_match": "MISMATCH"
    },
    {
        "id": "scenario_5_expired_document",
        "title": "Expired Travel Document",
        "scenario_type": "VALIDATION",
        "document_type": "PASSPORT",
        "description": "Document expiry date is in the past. Triggers automated rule engine validity failure.",
        "expected_risk_level": "REVIEW",
        "primary_anomaly": "Expired Validity Period",
        "fields": {
            "full_name": "MANISH GUPTA",
            "document_number": "H3382910",
            "nationality": "IND",
            "date_of_birth": "1985-06-20",
            "date_of_expiry": "2023-06-19",  # Expired
            "gender": "M"
        },
        "mrz_l1": "P<INDGUPTA<<MANISH<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "H3382910<9IND8506209M2306197<<<<<<<<<<<<<<08",
        "flags": {},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_6_passport_visa_mismatch",
        "title": "Passport & Visa Discrepancy",
        "scenario_type": "CROSS_DOCUMENT",
        "document_type": "PASSPORT",
        "description": "Presented passport number does not match the passport endorsement number on the attached visa.",
        "expected_risk_level": "HIGH",
        "primary_anomaly": "Cross-Document Mismatch",
        "fields": {
            "full_name": "ANANYA SEN",
            "document_number": "L9028174",
            "nationality": "IND",
            "date_of_birth": "1996-12-01",
            "date_of_expiry": "2033-12-01",
            "gender": "F"
        },
        "visa_fields": {
            "visa_number": "V-IND-88219",
            "passport_number_ref": "L9029999",  # Mismatch!
            "visa_type": "TOURIST T-30",
            "stay_duration_days": 30,
            "visa_validity_days": 90
        },
        "mrz_l1": "P<INDSEN<<ANANYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "L9028174<4IND9612017F3312016<<<<<<<<<<<<<<04",
        "flags": {},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_7_stamp_anomaly",
        "title": "Visa Stamp Forgery Anomaly",
        "scenario_type": "TAMPERING",
        "document_type": "VISA",
        "description": "Visa document shows an entry stamp with broken contour geometry, abnormal synthetic color gamut, and lack of ink bleeding into paper substrate.",
        "expected_risk_level": "REVIEW",
        "primary_anomaly": "Irregular Stamp Contour & Ink Profile",
        "fields": {
            "full_name": "KABIR KHAN",
            "document_number": "V2026981",
            "nationality": "IND",
            "date_of_birth": "1990-05-18",
            "date_of_expiry": "2027-05-17",
            "gender": "M"
        },
        "mrz_l1": "V<INDKHAN<<KABIR<<<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "V2026981<3IND9005189M2705170<<<<<<<<<<<<<<04",
        "flags": {"stamp_anomaly": True},
        "face_match": "MATCH"
    },
    {
        "id": "scenario_8_multi_identity",
        "title": "Multiple Identity Signal (Duplicate Registry)",
        "scenario_type": "MULTI_IDENTITY",
        "document_type": "PASSPORT",
        "description": "Same person portrait and document number previously recorded under a different registered name in the demonstration checkpoint history.",
        "expected_risk_level": "CRITICAL",
        "primary_anomaly": "Historical Identity Duplication Conflict",
        "fields": {
            "full_name": "ANIL KUMAR",
            "document_number": "P9182374",  # Flagged in historical registry!
            "nationality": "IND",
            "date_of_birth": "1987-09-14",
            "date_of_expiry": "2031-09-13",
            "gender": "M"
        },
        "mrz_l1": "P<INDKUMAR<<ANIL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "mrz_l2": "P9182374<9IND8709147M3109133<<<<<<<<<<<<<<08",
        "flags": {"multi_identity": True},
        "face_match": "MATCH"
    }
]

class DemoService:
    @staticmethod
    def _draw_synthetic_portrait(draw: ImageDraw.ImageDraw, x1: int, y1: int, x2: int, y2: int, gender: str = "M", is_altered: bool = False):
        """Draw a clean synthetic portrait representation."""
        pw = x2 - x1
        ph = y2 - y1
        
        # Background gradient / slate surface
        for i in range(ph):
            shade = 210 + int(25 * (i / ph))
            draw.line([(x1, y1 + i), (x2, y1 + i)], fill=(shade - 15, shade - 10, shade))

        cx = x1 + pw // 2
        cy = y1 + int(ph * 0.45)
        head_r = int(pw * 0.28)

        # Head / face oval
        skin = (225, 185, 150)
        draw.ellipse([cx - head_r, cy - head_r, cx + head_r, cy + head_r + 10], fill=skin)

        # Hair
        hair_color = (40, 30, 25)
        if gender == "F":
            draw.arc([cx - head_r - 6, cy - head_r - 8, cx + head_r + 6, cy + head_r + 30], 180, 360, fill=hair_color, width=12)
            draw.ellipse([cx - head_r - 4, cy - head_r - 6, cx + head_r + 4, cy - int(head_r * 0.3)], fill=hair_color)
        else:
            draw.ellipse([cx - head_r, cy - head_r - 8, cx + head_r + 4, cy - int(head_r * 0.2)], fill=hair_color)

        # Eyes with catchlights
        eye_y = cy - int(head_r * 0.1)
        draw.ellipse([cx - 16, eye_y - 4, cx - 8, eye_y + 4], fill=(30, 30, 30))
        draw.ellipse([cx + 8, eye_y - 4, cx + 16, eye_y + 4], fill=(30, 30, 30))
        draw.ellipse([cx - 14, eye_y - 3, cx - 11, eye_y], fill=(255, 255, 255))
        draw.ellipse([cx + 10, eye_y - 3, cx + 13, eye_y], fill=(255, 255, 255))

        # Eyebrows
        draw.line([(cx - 18, eye_y - 8), (cx - 6, eye_y - 8)], fill=hair_color, width=2)
        draw.line([(cx + 6, eye_y - 8), (cx + 18, eye_y - 8)], fill=hair_color, width=2)

        # Nose & Mouth
        draw.line([(cx, eye_y + 4), (cx - 2, eye_y + 14), (cx + 3, eye_y + 16)], fill=(180, 140, 110), width=2)
        draw.arc([cx - 10, cy + 18, cx + 10, cy + 28], 0, 180, fill=(160, 90, 80), width=2)

        # Shoulders / suit
        suit_color = (45, 60, 85)
        draw.polygon([(x1, y2), (cx - 25, cy + head_r + 15), (cx + 25, cy + head_r + 15), (x2, y2)], fill=suit_color)
        draw.polygon([(cx - 10, cy + head_r + 15), (cx, cy + head_r + 28), (cx + 10, cy + head_r + 15)], fill=(240, 240, 245))

        # Corner tabs for authentic passport photo mount
        tab_len = 10
        tab_col = (140, 155, 175)
        draw.line([(x1, y1), (x1 + tab_len, y1)], fill=tab_col, width=2)
        draw.line([(x1, y1), (x1, y1 + tab_len)], fill=tab_col, width=2)
        draw.line([(x2, y1), (x2 - tab_len, y1)], fill=tab_col, width=2)
        draw.line([(x2, y1), (x2, y1 + tab_len)], fill=tab_col, width=2)
        draw.line([(x1, y2), (x1 + tab_len, y2)], fill=tab_col, width=2)
        draw.line([(x1, y2), (x1, y2 - tab_len)], fill=tab_col, width=2)
        draw.line([(x2, y2), (x2 - tab_len, y2)], fill=tab_col, width=2)
        draw.line([(x2, y2), (x2, y2 - tab_len)], fill=tab_col, width=2)

        # If altered photo, draw visible digital splicing / compression noise around edge
        if is_altered:
            # Draw abnormal harsh border discontinuity
            draw.rectangle([x1, y1, x2, y2], outline=(220, 38, 38), width=3)
            # Add synthetic block boundary artifacts
            for _ in range(400):
                rx = np.random.randint(x1 + 2, x2 - 2)
                ry = np.random.randint(y1 + 2, y2 - 2)
                draw.point((rx, ry), fill=(255, 240, 180))

    @staticmethod
    def _draw_guilloche(draw: ImageDraw.ImageDraw, w: int, h: int):
        """Draw subtle dual-frequency Guilloche security background curves."""
        for i in range(0, h, 20):
            pts = []
            for x in range(0, w, 10):
                y_offset = math.sin(x * 0.035 + i * 0.1) * 7 + math.cos(x * 0.015) * 5
                pts.append((x, i + y_offset))
            if len(pts) > 1:
                draw.line(pts, fill=(225, 233, 242), width=1)

    @staticmethod
    def _draw_security_crest(draw: ImageDraw.ImageDraw, cx: int, cy: int):
        """Draw an official security emblem watermark in the document substrate."""
        crest_color = (220, 230, 240)
        # Concentric security rings
        for r in [60, 50, 40, 25]:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=crest_color, width=1)
        # 16-spoke emblem star / chakra
        for idx in range(16):
            angle = idx * (math.pi / 8)
            x_end = cx + int(48 * math.cos(angle))
            y_end = cy + int(48 * math.sin(angle))
            draw.line([(cx, cy), (x_end, y_end)], fill=crest_color, width=1)
        # Inner shield
        sw, sh = 18, 22
        draw.polygon([(cx - sw, cy - sh), (cx + sw, cy - sh), (cx + sw, cy + int(sh*0.3)), (cx, cy + sh), (cx - sw, cy + int(sh*0.3))], outline=crest_color, width=1)

    @staticmethod
    def _draw_signature(draw: ImageDraw.ImageDraw, x: int, y: int):
        """Draw official issuing officer cursive signature curve."""
        sig_color = (25, 35, 95) # blue pen ink
        pts = [
            (x, y + 10), (x + 8, y + 2), (x + 18, y + 16), (x + 28, y - 4),
            (x + 36, y + 8), (x + 48, y + 2), (x + 60, y + 14), (x + 75, y),
            (x + 95, y + 6), (x + 110, y + 2)
        ]
        draw.line(pts, fill=sig_color, width=2)
        draw.line([(x, y + 18), (x + 120, y + 18)], fill=(180, 190, 205), width=1)
        draw.text((x, y + 20), "HOLDER'S SIGNATURE / SIGNATURE", fill=(140, 155, 170))

    @staticmethod
    def _draw_stamp(draw: ImageDraw.ImageDraw, cx: int, cy: int, is_anomaly: bool = False):
        """Draw official-looking visa / checkpoint entry stamp."""
        ink = (160, 30, 45) if not is_anomaly else (210, 30, 80)
        r = 55
        
        if not is_anomaly:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ink, width=3)
            draw.ellipse([cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8], outline=ink, width=1)
            draw.text((cx - 36, cy - 20), "IMMIGRATION", fill=ink)
            draw.text((cx - 28, cy - 6), "ENTRY / SSB", fill=ink)
            draw.text((cx - 30, cy + 10), "12 SEP 2026", fill=ink)
        else:
            # Irregular / forged stamp: jagged polygonal distortion
            points = []
            num_pts = 16
            for idx in range(num_pts):
                angle = idx * (2 * math.pi / num_pts)
                radius = r + (np.random.randint(-14, 12))
                points.append((cx + int(radius * math.cos(angle)), cy + int(radius * math.sin(angle))))
            draw.polygon(points, outline=ink, width=4)
            draw.text((cx - 36, cy - 14), "FORGED STAMP", fill=ink)
            draw.text((cx - 26, cy + 4), "ANOMALY", fill=ink)

    @classmethod
    def generate_scenario_document(cls, scenario: Dict[str, Any]) -> Tuple[str, str]:
        """
        Generate high-resolution synthetic passport / visa image for a scenario.
        Returns: (doc_image_rel_path, presented_image_rel_path)
        """
        doc_w, doc_h = 860, 580
        img = Image.new('RGB', (doc_w, doc_h), color=(248, 249, 251))
        draw = ImageDraw.Draw(img)

        # 1. Draw Security Substrate Background
        cls._draw_guilloche(draw, doc_w, doc_h)

        # 2. Draw Central Security Crest Watermark
        cls._draw_security_crest(draw, 520, 270)

        # 3. Draw Header Band (Sovereign / SSB Passport Style)
        draw.rectangle([0, 0, doc_w, 75], fill=(22, 34, 52))
        draw.text((32, 16), "PASSPORT / PASSEPORT", fill=(240, 245, 255))
        draw.text((32, 40), "DEMOCRATIC REPUBLIC OF INNOVATION — TRAVEL DOCUMENT", fill=(170, 188, 210))
        draw.text((680, 24), "TYPE: P  |  IND", fill=(210, 225, 245))

        # Microtext Security Strip under header
        draw.rectangle([0, 75, doc_w, 82], fill=(45, 65, 95))
        draw.text((12, 75), "• • REPUBLIC OF INNOVATION • • BORDER IMMIGRATION CONTROL • • ICAO 9303 • • SECURITY SUBSTRATE • • ", fill=(160, 185, 215))

        # Synthetic Disclaimer Watermark Banner
        draw.rectangle([0, 82, doc_w, 102], fill=(254, 243, 199))
        draw.text((28, 85), "SYNTHETIC DEMONSTRATION DOCUMENT — NOT A REAL IDENTITY DOCUMENT (SIH2026188)", fill=(146, 64, 14))

        fields = scenario["fields"]
        flags = scenario.get("flags", {})

        # Draw Portrait Box (x: 45 to 275, y: 125 to 425)
        px1, py1, px2, py2 = 45, 125, 275, 425
        draw.rectangle([px1 - 2, py1 - 2, px2 + 2, py2 + 2], outline=(175, 188, 205), width=2)
        cls._draw_synthetic_portrait(draw, px1, py1, px2, py2, gender=fields.get("gender", "M"), is_altered=flags.get("altered_photo", False))

        # Visual Inspection Zone (VIZ) Text
        vx = 305
        y = 125
        spacing = 40

        items = [
            ("SURNAME / NOM", fields["full_name"].split()[-1] if len(fields["full_name"].split()) > 1 else fields["full_name"]),
            ("GIVEN NAMES / PRENOMS", fields["full_name"].split()[0]),
            ("NATIONALITY / NATIONALITE", fields.get("nationality", "IND")),
            ("DOCUMENT NO. / NO DU PASSEPORT", fields.get("document_number", "P0000000")),
            ("DATE OF BIRTH / DATE DE NAISSANCE", fields.get("date_of_birth", "1990-01-01")),
            ("SEX / SEXE", fields.get("gender", "M")),
            ("DATE OF EXPIRY / DATE D'EXPIRATION", fields.get("date_of_expiry", "2030-01-01"))
        ]

        for label, val in items:
            draw.text((vx, y), label, fill=(115, 128, 145))
            draw.text((vx, y + 14), str(val), fill=(18, 28, 42))
            y += spacing

        # Draw Holder's Signature block
        cls._draw_signature(draw, 560, 365)

        # Draw Stamp if scenario calls for it
        cls._draw_stamp(draw, 720, 240, is_anomaly=flags.get("stamp_anomaly", False))

        # Draw Machine Readable Zone (MRZ) at Bottom
        mrz_bg_y = 445
        draw.rectangle([0, mrz_bg_y, doc_w, doc_h], fill=(238, 242, 247))
        draw.line([(0, mrz_bg_y), (doc_w, mrz_bg_y)], fill=(195, 205, 218), width=2)

        l1 = scenario.get("mrz_l1", "P<INDDEMO<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        l2 = scenario.get("mrz_l2", "00000000<0IND0000000M0000000<<<<<<<<<<<<<<00")

        draw.text((32, mrz_bg_y + 24), l1, fill=(20, 25, 35))
        draw.text((32, mrz_bg_y + 64), l2, fill=(20, 25, 35))

        # Save document image
        doc_filename = f"demo_doc_{scenario['id']}.jpg"
        doc_path = settings.UPLOADS_DIR / doc_filename
        img.save(str(doc_path), 'JPEG', quality=95)

        # Generate Presented Person Photo
        p_w, p_h = 360, 440
        presented_img = Image.new('RGB', (p_w, p_h), color=(235, 240, 245))
        p_draw = ImageDraw.Draw(presented_img)
        
        # Check if scenario is mismatch or match
        is_mismatch = (scenario.get("face_match") == "MISMATCH")
        p_gender = "F" if (is_mismatch and fields.get("gender") == "M") else ("M" if is_mismatch else fields.get("gender", "M"))

        cls._draw_synthetic_portrait(p_draw, 30, 30, p_w - 30, p_h - 30, gender=p_gender, is_altered=False)
        p_draw.rectangle([0, 0, p_w, 28], fill=(30, 45, 65))
        p_draw.text((15, 6), "PRESENTED SUBJECT / LIVE SCAN", fill=(240, 245, 255))

        presented_filename = f"demo_presented_{scenario['id']}.jpg"
        presented_path = settings.UPLOADS_DIR / presented_filename
        presented_img.save(str(presented_path), 'JPEG', quality=95)

        return f"/uploads/{doc_filename}", f"/uploads/{presented_filename}"

    @classmethod
    def get_all_scenarios(cls) -> List[Dict[str, Any]]:
        return DEMO_SCENARIOS

    @classmethod
    def get_scenario_by_id(cls, scenario_id: str) -> Optional[Dict[str, Any]]:
        for s in DEMO_SCENARIOS:
            if s["id"] == scenario_id:
                return s
        return None

demo_service = DemoService()
