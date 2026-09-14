import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.trip import Trip, TripStatus
from app.models.driver import Driver, DriverStatus
from app.schemas.trip import TripResponse, TripCreate

router = APIRouter(prefix='/trips', tags=['Trips & Logistics Movements'])

@router.get('', response_model=List[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.started_at.desc()).all()

@router.get('/{id}', response_model=TripResponse)
def get_trip(id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post('', response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    code = f"NER-TRIP-{uuid.uuid4().hex[:6].upper()}"
    trip = Trip(
        tracking_code=code,
        **payload.model_dump(),
        status=TripStatus.IN_TRANSIT
    )
    db.add(trip)
    
    # Update driver status
    driver = db.query(Driver).filter(Driver.id == payload.driver_id).first()
    if driver:
        driver.status = DriverStatus.ON_TRIP
        
    db.commit()
    db.refresh(trip)
    return trip

@router.post('/{id}/complete', response_model=TripResponse)
def complete_trip(id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.status = TripStatus.DELIVERED
    trip.completed_at = datetime.now(timezone.utc)
    
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    if driver:
        driver.status = DriverStatus.IDLE
        
    db.commit()
    db.refresh(trip)
    return trip

@router.post('/{id}/reroute', response_model=TripResponse)
def reroute_trip(id: int, alternate_geometry: str, delay_reasons: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.route_geometry = alternate_geometry
    trip.delay_reasons = delay_reasons
    trip.expected_delay_minutes = max(0, trip.expected_delay_minutes - 90)
    trip.risk_adjusted_eta_minutes = trip.normal_eta_minutes + trip.expected_delay_minutes
    db.commit()
    db.refresh(trip)
    return trip
