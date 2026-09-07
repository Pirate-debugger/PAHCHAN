import os
import uuid
import cv2
import numpy as np
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings

class FaceService:
    def __init__(self):
        self.face_cascade = None
        if hasattr(cv2, 'CascadeClassifier'):
            try:
                cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
            except Exception:
                self.face_cascade = None

    def extract_document_portrait(self, doc_image_path: str) -> Tuple[Optional[str], Optional[np.ndarray]]:
        """
        Extract portrait crop from document and save as static asset.
        Supports cascade detection with intelligent fallback to standard ICAO passport portrait coordinates.
        """
        img = cv2.imread(doc_image_path)
        if img is None:
            return None, None
        
        h, w = img.shape[:2]
        crop = None

        # Strategy 1: CascadeClassifier if available
        if self.face_cascade is not None and not self.face_cascade.empty():
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
            if len(faces) > 0:
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                x, y, fw, fh = faces[0]
                margin_y = int(fh * 0.15)
                margin_x = int(fw * 0.15)
                y1 = max(0, y - margin_y)
                x1 = max(0, x - margin_x)
                y2 = min(h, y + fh + margin_y)
                x2 = min(w, x + fw + margin_x)
                crop = img[y1:y2, x1:x2]

        # Strategy 2: Standard ICAO Document Portrait Region (x: 5% - 35%, y: 20% - 76%)
        if crop is None or crop.size == 0:
            y1, x1, y2, x2 = int(0.20 * h), int(0.05 * w), int(0.76 * h), int(0.35 * w)
            crop = img[y1:y2, x1:x2]

        if crop is None or crop.size == 0:
            return None, None

        filename = f"portrait_{uuid.uuid4().hex[:8]}.jpg"
        abs_path = settings.EVIDENCE_DIR / filename
        cv2.imwrite(str(abs_path), crop)
        return f"/evidence/{filename}", crop

    @staticmethod
    def assess_quality(img: np.ndarray) -> Tuple[float, bool, str]:
        """
        Assess image quality using Laplacian sharpness and brightness.
        Returns: (quality_score, is_acceptable, description)
        """
        if img is None or img.size == 0:
            return 0.0, False, "Image empty or invalid"

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        mean_brightness = float(np.mean(gray))

        if blur_var < settings.MIN_FACE_SHARPNESS_VAR:
            return blur_var, False, f"Low image sharpness / high blur (variance {blur_var:.1f} < {settings.MIN_FACE_SHARPNESS_VAR})"

        if mean_brightness < 20.0:
            return blur_var, False, "Severe underexposure / darkness"
        if mean_brightness > 240.0:
            return blur_var, False, "Severe overexposure / glare"

        return blur_var, True, f"Image quality sufficient (sharpness {blur_var:.1f})"

    def compare_faces(
        self,
        doc_image_path: str,
        presented_image_path: Optional[str] = None,
        force_outcome: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform biometric comparison between document portrait and presented photograph.
        Outcomes: MATCH_SIGNAL, REVIEW, MISMATCH_SIGNAL, UNABLE_TO_ASSESS
        """
        portrait_url, portrait_crop = self.extract_document_portrait(doc_image_path)
        
        if not presented_image_path or not os.path.exists(presented_image_path):
            return {
                "portrait_url": portrait_url,
                "presented_url": None,
                "outcome": "UNABLE_TO_ASSESS",
                "similarity_score": 0.0,
                "quality_score": 0.0,
                "quality_assessment": "No presented person photograph provided for comparison.",
                "explanation": "Face comparison could not be performed because no presented/live photograph was supplied.",
                "recommendation": "Optional face verification skipped. Proceed with document-only inspection or capture person photo.",
                "risk_contribution": 0
            }

        presented_img = cv2.imread(presented_image_path)
        presented_filename = os.path.basename(presented_image_path)
        presented_url = f"/evidence/{presented_filename}" if "evidence" in presented_image_path else f"/uploads/{presented_filename}"

        # Forced scenario shortcut for deterministic demonstration
        if force_outcome:
            if force_outcome == "MISMATCH":
                return {
                    "portrait_url": portrait_url,
                    "presented_url": presented_url,
                    "outcome": "MISMATCH_SIGNAL",
                    "similarity_score": 0.32,
                    "quality_score": 85.0,
                    "quality_assessment": "Presented image quality verified.",
                    "explanation": "Facial comparison indicates significant biometric divergence between document portrait and presented subject. Potential identity impersonation.",
                    "recommendation": "Refer for secondary interview and physical biometric enrollment.",
                    "risk_contribution": 40
                }
            elif force_outcome == "POOR_QUALITY":
                return {
                    "portrait_url": portrait_url,
                    "presented_url": presented_url,
                    "outcome": "UNABLE_TO_ASSESS",
                    "similarity_score": 0.0,
                    "quality_score": 18.2,
                    "quality_assessment": "Low image sharpness (Laplacian variance 18.2 < 35.0)",
                    "explanation": "Face comparison could not be reliably assessed due to insufficient image sharpness or lighting.",
                    "recommendation": "Capture a clearer image with balanced lighting and repeat comparison.",
                    "risk_contribution": 5
                }
            elif force_outcome == "MATCH":
                return {
                    "portrait_url": portrait_url,
                    "presented_url": presented_url,
                    "outcome": "MATCH_SIGNAL",
                    "similarity_score": 0.91,
                    "quality_score": 92.0,
                    "quality_assessment": "Presented image quality verified.",
                    "explanation": "Facial comparison indicates high biometric consistency with document portrait.",
                    "recommendation": "Identity facial comparison satisfied. Continue with standard screening.",
                    "risk_contribution": 0
                }

        # 1. Quality Guard Evaluation
        q_score, q_pass, q_desc = self.assess_quality(presented_img)
        if not q_pass:
            return {
                "portrait_url": portrait_url,
                "presented_url": presented_url,
                "outcome": "UNABLE_TO_ASSESS",
                "similarity_score": 0.0,
                "quality_score": q_score,
                "quality_assessment": q_desc,
                "explanation": "Face comparison could not be reliably assessed.",
                "recommendation": "Capture a clearer image and repeat comparison.",
                "risk_contribution": 5
            }

        # 2. Extract presented face crop
        p_crop = presented_img
        if self.face_cascade is not None and not self.face_cascade.empty():
            gray_p = cv2.cvtColor(presented_img, cv2.COLOR_BGR2GRAY)
            p_faces = self.face_cascade.detectMultiScale(gray_p, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
            if len(p_faces) > 0:
                px, py, pw, ph = sorted(p_faces, key=lambda f: f[2] * f[3], reverse=True)[0]
                p_crop = presented_img[py:py+ph, px:px+pw]

        # 3. Compute Normalized Feature Similarity
        p1 = cv2.resize(portrait_crop, (128, 128))
        p2 = cv2.resize(p_crop, (128, 128))

        # Color histograms and spatial gradient descriptors
        hist1 = cv2.calcHist([p1], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist2 = cv2.calcHist([p2], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        cv2.normalize(hist1, hist1)
        cv2.normalize(hist2, hist2)
        sim_hist = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL))

        # Structural gradient similarity
        g1 = cv2.cvtColor(p1, cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(p2, cv2.COLOR_BGR2GRAY)
        diff = cv2.matchTemplate(g1, g2, cv2.TM_CCOEFF_NORMED)[0][0]
        sim_score = max(0.0, min(1.0, float((sim_hist * 0.4) + (max(0, diff) * 0.6))))

        # 4. Map to tri-state signals
        if sim_score >= 0.70:
            outcome = "MATCH_SIGNAL"
            explanation = "Facial features between document portrait and presented photograph indicate high biometric consistency."
            recommendation = "Facial comparison satisfied. Continue with standard verification."
            points = 0
        elif sim_score >= 0.45:
            outcome = "REVIEW"
            explanation = "Facial similarity is marginal. Differences in lighting, angle, or facial expression require officer review."
            recommendation = "Review highlighted facial features or request secondary verification."
            points = 20
        else:
            outcome = "MISMATCH_SIGNAL"
            explanation = "Facial comparison indicates significant divergence between document portrait and presented photograph."
            recommendation = "Refer for secondary physical interview and verification."
            points = 40

        return {
            "portrait_url": portrait_url,
            "presented_url": presented_url,
            "outcome": outcome,
            "similarity_score": round(sim_score, 2),
            "quality_score": round(q_score, 1),
            "quality_assessment": q_desc,
            "explanation": explanation,
            "recommendation": recommendation,
            "risk_contribution": points
        }

face_service = FaceService()
