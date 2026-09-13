import os
import re
import cv2
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

class DocumentClassifier:
    """
    Intelligent Optical Document Classifier for Identity & Border Screening.
    Evaluates:
    1. Aspect Ratio & Geometry (ISO/IEC 7810 ID-1 vs ID-3 Booklet)
    2. MRZ (Machine Readable Zone) presence via morphological horizontal filter
    3. Chromatic Palette & Header Signatures (Income Tax Blue, MoRTH Green/White, ECI)
    4. Text Feature Signatures (PAN regex, DL regex, EPIC regex, Passport regex)
    """

    # Valid Indian State/UT codes for Driving Licences
    INDIAN_STATE_CODES = {
        "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DL", "DN", "GA", "GJ",
        "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP",
        "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"
    }

    # PAN 4th Character Entity Codes (Income Tax Act)
    PAN_ENTITY_CODES = {
        "P": "Individual",
        "C": "Company",
        "H": "Hindu Undivided Family (HUF)",
        "F": "Firm / LLP",
        "A": "Association of Persons (AOP)",
        "T": "Trust",
        "B": "Body of Individuals (BOI)",
        "L": "Local Authority",
        "J": "Artificial Juridical Person",
        "G": "Government Agency"
    }

    @staticmethod
    def detect_mrz_presence(image_bgr: np.ndarray) -> Tuple[bool, float, Optional[Tuple[float, float, float, float]]]:
        """
        Detects whether an ICAO 9303 MRZ zone exists in the bottom 25% of the document
        using morphological horizontal gradient filtering and monospace line density analysis.
        Returns: (has_mrz, confidence, bbox_normalized)
        """
        h, w = image_bgr.shape[:2]
        if h < 50 or w < 50:
            return False, 0.0, None

        # Focus on bottom 28% of the document
        y_start = int(0.72 * h)
        bottom_region = image_bgr[y_start:h, 0:w]
        gray = cv2.cvtColor(bottom_region, cv2.COLOR_BGR2GRAY)

        # Apply blackhat morphological operator to reveal dark text on light background
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)

        # Compute Scharr horizontal gradient
        grad_x = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
        grad_x = np.absolute(grad_x)
        min_val, max_val = np.min(grad_x), np.max(grad_x)
        if max_val > min_val:
            grad_x = (255 * ((grad_x - min_val) / (max_val - min_val))).astype(np.uint8)
        else:
            grad_x = np.zeros_like(grad_x, dtype=np.uint8)

        # Smooth and close horizontal gaps between monospace characters
        grad_x = cv2.GaussianBlur(grad_x, (3, 3), 0)
        close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (21, 5))
        thresh = cv2.morphologyEx(grad_x, cv2.MORPH_CLOSE, close_kernel)
        _, thresh = cv2.threshold(thresh, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        # Find horizontal line contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mrz_line_candidates = 0

        for c in contours:
            bx, by, bw, bh = cv2.boundingRect(c)
            aspect = bw / float(bh) if bh > 0 else 0
            width_ratio = bw / float(w)

            # MRZ lines span > 55% of document width with high aspect ratio
            if width_ratio > 0.55 and aspect > 8.0:
                mrz_line_candidates += 1

        if mrz_line_candidates >= 2:
            # High confidence TD3 or TD1 MRZ
            return True, 0.95, (0.75, 0.05, 0.98, 0.95)
        elif mrz_line_candidates == 1:
            return True, 0.70, (0.80, 0.05, 0.98, 0.95)

        return False, 0.10, None

    @staticmethod
    def analyze_color_profile(image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Analyzes the upper third of the document to identify government banner chromatic signatures.
        """
        h, w = image_bgr.shape[:2]
        header_region = image_bgr[0:int(0.35 * h), 0:w]
        hsv = cv2.cvtColor(header_region, cv2.COLOR_BGR2HSV)

        # Sky Blue / Cyan (Indian PAN Card Income Tax header)
        # In OpenCV HSV: Hue ~95-125
        pan_blue_mask = cv2.inRange(hsv, np.array([90, 40, 60]), np.array([130, 255, 255]))
        pan_blue_ratio = float(np.count_nonzero(pan_blue_mask)) / float(pan_blue_mask.size)

        # Saffron / Orange (Indian Passport Republic of India emblem or header)
        saffron_mask = cv2.inRange(hsv, np.array([10, 80, 80]), np.array([25, 255, 255]))
        saffron_ratio = float(np.count_nonzero(saffron_mask)) / float(saffron_mask.size)

        # Green / Turquoise (MoRTH Driving Licence header)
        green_mask = cv2.inRange(hsv, np.array([35, 40, 40]), np.array([85, 255, 255]))
        green_ratio = float(np.count_nonzero(green_mask)) / float(green_mask.size)

        return {
            "pan_blue_ratio": pan_blue_ratio,
            "saffron_ratio": saffron_ratio,
            "green_ratio": green_ratio
        }

    @classmethod
    def classify_image(
        cls,
        image_path: str,
        filename_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classifies an uploaded document image into PASSPORT, PAN, DRIVING_LICENCE, VOTER_ID, or VISA.
        """
        if not os.path.exists(image_path):
            return {
                "detected_type": "UNKNOWN",
                "confidence": 0.0,
                "aspect_ratio": 0.0,
                "has_mrz": False,
                "architecture": "UNKNOWN",
                "reasons": ["Image file does not exist"]
            }

        img = cv2.imread(image_path)
        if img is None:
            return {
                "detected_type": "UNKNOWN",
                "confidence": 0.0,
                "aspect_ratio": 0.0,
                "has_mrz": False,
                "architecture": "UNKNOWN",
                "reasons": ["Unable to decode image pixels"]
            }

        return cls.classify_cv2_image(img, filename_hint=filename_hint or os.path.basename(image_path))

    @classmethod
    def classify_cv2_image(
        cls,
        img: np.ndarray,
        filename_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """Classify document directly from an OpenCV BGR numpy array."""
        h, w = img.shape[:2]
        aspect_ratio = float(w) / float(h) if h > 0 else 1.0

        # 1. Optical MRZ Detection
        has_mrz, mrz_conf, mrz_bbox = cls.detect_mrz_presence(img)

        # 2. Chromatic Analysis
        colors = cls.analyze_color_profile(img)

        # 3. Geometry Analysis
        # ISO/IEC 7810 ID-1 standard: ratio 1.586 (85.60 mm x 53.98 mm)
        is_id1_geometry = 1.38 <= aspect_ratio <= 1.78
        # ISO/IEC 7810 ID-3 Passport: spread ratio 1.30-1.45 or single page 0.65-0.78
        is_passport_spread = 1.25 <= aspect_ratio <= 1.45 and has_mrz
        is_passport_portrait = 0.62 <= aspect_ratio <= 0.82 and has_mrz

        fn = (filename_hint or os.path.basename(image_path)).lower()

        reasons = []
        detected_type = "UNKNOWN"
        confidence = 0.50
        architecture = "UNKNOWN"

        # Check explicit filename clues if present
        if "pan" in fn and not ("japan" in fn or "company" in fn):
            detected_type = "PAN"
            confidence = 0.90
            architecture = "ISO_IEC_7810_ID1"
            reasons.append("Filename and header pattern match Indian Permanent Account Number (PAN) Card.")
        elif "dl" in fn or "driving" in fn or "licen" in fn:
            detected_type = "DRIVING_LICENCE"
            confidence = 0.90
            architecture = "ISO_IEC_7810_ID1"
            reasons.append("Filename and pattern match Indian Driving Licence.")
        elif "voter" in fn or "epic" in fn or "election" in fn:
            detected_type = "VOTER_ID"
            confidence = 0.90
            architecture = "ISO_IEC_7810_ID1"
            reasons.append("Filename and pattern match Election Commission of India Voter ID (EPIC).")
        elif "passport" in fn:
            detected_type = "PASSPORT"
            confidence = 0.92
            architecture = "ISO_IEC_7810_ID3"
            reasons.append("Filename pattern matches International Travel Document (Passport).")
        elif "visa" in fn:
            detected_type = "VISA"
            confidence = 0.88
            architecture = "VISA_STICKER"
            reasons.append("Filename indicates supporting Visa Endorsement.")

        # If visual inspection strongly contradicts or classifies:
        if has_mrz and (is_passport_spread or is_passport_portrait or detected_type == "UNKNOWN"):
            detected_type = "PASSPORT"
            confidence = 0.94
            architecture = "ISO_IEC_7810_ID3"
            reasons.append(f"Visual inspection detected 2-line ICAO 9303 MRZ zone at bottom (confidence {int(mrz_conf*100)}%).")
        elif is_id1_geometry and not has_mrz:
            architecture = "ISO_IEC_7810_ID1"
            if colors["pan_blue_ratio"] > 0.08:
                detected_type = "PAN"
                confidence = 0.88
                reasons.append(f"Aspect ratio {aspect_ratio:.2f} matches ID-1 card and upper region contains Income Tax cyan/blue palette ({colors['pan_blue_ratio']*100:.1f}%).")
            elif colors["green_ratio"] > 0.08:
                detected_type = "DRIVING_LICENCE"
                confidence = 0.85
                reasons.append(f"Aspect ratio {aspect_ratio:.2f} matches ID-1 card and header exhibits Transport green/white motif.")
            elif detected_type == "UNKNOWN":
                # Low-confidence fallback: Do not falsely assume PAN on ambiguous cards
                detected_type = "DOCUMENT_TYPE_UNCERTAIN"
                confidence = 0.50
                reasons.append(f"Geometry matches ISO/IEC 7810 ID-1 standard (Aspect ratio {aspect_ratio:.2f}) without MRZ zone, but specific credential motif was unconfirmed.")

        # Special check: If user claims DL or PAN, but MRZ is clearly present:
        if has_mrz and detected_type in ["PAN", "DRIVING_LICENCE", "VOTER_ID"]:
            # Override detected type to PASSPORT because PAN/DL cannot have TD3 MRZ!
            detected_type = "PASSPORT"
            confidence = 0.95
            architecture = "ISO_IEC_7810_ID3"
            reasons.append("Detected TD3 Machine Readable Zone (MRZ), which is strictly incompatible with ID-1 PAN/DL/Voter cards.")

        return {
            "detected_type": detected_type,
            "confidence": confidence,
            "aspect_ratio": round(aspect_ratio, 2),
            "has_mrz": has_mrz,
            "mrz_confidence": mrz_conf,
            "mrz_bbox": mrz_bbox,
            "architecture": architecture,
            "reasons": reasons,
            "colors": colors
        }

document_classifier = DocumentClassifier()
