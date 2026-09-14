from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.road_segment import RoadSegment
from app.schemas.route import RouteCompareRequest, RouteCompareResponse
from app.schemas.road_segment import RoadSegmentResponse
from app.services.routing_service import routing_service, NE_HUBS

router = APIRouter(prefix='/routes', tags=['GIS & Routing'])

@router.post('/compare', response_model=RouteCompareResponse)
def compare_routes(req: RouteCompareRequest, db: Session = Depends(get_db)):
    return routing_service.evaluate_routes(req, db)

@router.get('/segments', response_model=List[RoadSegmentResponse])
def get_monitored_segments(db: Session = Depends(get_db)):
    segments = db.query(RoadSegment).all()
    return segments

@router.get('/hubs')
def get_ne_hubs():
    return [{'name': k, 'coordinates': v} for k, v in NE_HUBS.items()]
