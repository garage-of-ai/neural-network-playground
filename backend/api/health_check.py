from fastapi import APIRouter
from services.dataset_service import list_available_kinds

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/datasets")
def datasets():
    return list_available_kinds()
