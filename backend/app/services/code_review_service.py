# This module re-exports code_review_service from coding_service.
# The coding router imports from this module name.
from app.services.coding_service import code_review_service

__all__ = ["code_review_service"]
