import io
import logging
# pyrefly: ignore [missing-import]
from pypdf import PdfReader

logger = logging.getLogger("pdf_service")

class PDFService:
    def extract_text_from_bytes(self, file_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError("Failed to extract text from PDF document.")

pdf_service = PDFService()
