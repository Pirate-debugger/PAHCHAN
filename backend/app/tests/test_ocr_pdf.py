"""
Unit Tests for PDF Document Ingestion and MRZ Text Extraction (P0.3)
Verifies that real PDF passport scans extract actual parsed fields,
not the filename-hash fallback.
"""

import io
import pytest
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject, DictionaryObject
from starlette.testclient import TestClient
from app.main import app
from app.services.ocr_service import extract_fields_from_document

client = TestClient(app)

def create_sample_mrz_pdf(
    line1: str = "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    line2: str = "Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00"
) -> bytes:
    """Generates a minimal valid PDF containing MRZ text stream."""
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)

    font_dict = DictionaryObject({
        NameObject('/Type'): NameObject('/Font'),
        NameObject('/Subtype'): NameObject('/Type1'),
        NameObject('/BaseFont'): NameObject('/Helvetica'),
        NameObject('/Encoding'): NameObject('/WinAnsiEncoding')
    })
    font_ref = writer._add_object(font_dict)

    res_dict = DictionaryObject({
        NameObject('/Font'): DictionaryObject({NameObject('/F1'): font_ref})
    })
    page[NameObject('/Resources')] = res_dict

    stream = DecodedStreamObject()
    stream_content = (
        f"BT\n"
        f"/F1 12 Tf\n"
        f"72 700 Td\n"
        f"({line1}) Tj\n"
        f"0 -15 Td\n"
        f"({line2}) Tj\n"
        f"ET\n"
    ).encode("latin1")
    stream.set_data(stream_content)
    page[NameObject('/Contents')] = writer._add_object(stream)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.getvalue()

def test_extract_fields_from_real_pdf_mrz():
    """P0.3: extract_fields_from_document extracts real fields from PDF, not filename fallback."""
    pdf_bytes = create_sample_mrz_pdf()
    
    result = extract_fields_from_document(pdf_bytes, filename="random_scan_document.pdf")
    fields = result["fields"]
    
    # Assert fields are extracted from the actual PDF MRZ content, NOT derived from 'random_scan_document'
    assert fields["docNumber"] == "Z4819203"
    assert fields["nationality"] == "IND"
    assert "KUMAR" in fields["name"]
    assert "RAHUL" in fields["name"]
    assert fields["expiryDate"] == "2030-08-15"
    assert fields["mrzLine1"].startswith("P<IND")
    assert fields["mrzLine2"].startswith("Z4819203")

def test_pdf_upload_end_to_end_screening():
    """P0.3: Uploading PDF to /api/v1/screenings extracts MRZ and passes validation."""
    pdf_bytes = create_sample_mrz_pdf()
    
    response = client.post(
        "/api/v1/screenings",
        headers={"X-API-Key": "pahchan-secret-api-key-2026"},
        files={"doc_file": ("scanned_passport.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"doc_type": "PASSPORT"}
    )
    assert response.status_code == 200
    res_data = response.json()
    
    assert res_data["fields"]["docNumber"] == "Z4819203"
    assert res_data["fields"]["nationality"] == "IND"
    assert res_data["validation"]["format"] == "TD3"
    assert res_data["validation"]["mrz_checksum_pass"] is True
