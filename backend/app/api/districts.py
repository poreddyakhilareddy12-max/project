from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.district import District
from app.schemas.district import DistrictResponse

router = APIRouter(prefix='/districts', tags=['District Accessibility'])

@router.get('', response_model=List[DistrictResponse])
def get_districts(db: Session = Depends(get_db)):
    return db.query(District).order_by(District.accessibility_score.asc()).all()
