from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.models.gps_breadcrumb import GPSBreadcrumb
from app.models.trip import Trip, TripStatus
from app.schemas.vehicle import VehicleResponse, VehicleCreate, VehicleLocationUpdate

router = APIRouter(prefix='/vehicles', tags=['Vehicles & Fleet'])

@router.get('', response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.get('/{id}', response_model=VehicleResponse)
def get_vehicle(id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.post('', response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.registration_number == payload.registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.post('/{id}/location', response_model=VehicleResponse)
def update_vehicle_location(id: int, loc: VehicleLocationUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    vehicle.current_lat = loc.latitude
    vehicle.current_lng = loc.longitude
    if loc.speed_kmh is not None:
        vehicle.speed_kmh = loc.speed_kmh
    vehicle.last_gps_ping = datetime.now(timezone.utc)
    
    # Check if there is an active trip to record breadcrumb
    active_trip = db.query(Trip).filter(Trip.vehicle_id == id, Trip.status == TripStatus.IN_TRANSIT).first()
    if active_trip:
        crumb = GPSBreadcrumb(
            trip_id=active_trip.id,
            vehicle_id=vehicle.id,
            latitude=loc.latitude,
            longitude=loc.longitude,
            speed=vehicle.speed_kmh
        )
        db.add(crumb)
        
    db.commit()
    db.refresh(vehicle)
    return vehicle
