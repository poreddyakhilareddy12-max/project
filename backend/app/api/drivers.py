from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.driver import Driver, DriverStatus
from app.models.trip import Trip, TripStatus
from app.schemas.driver import DriverResponse, DriverCreate
from app.schemas.trip import TripResponse

router = APIRouter(prefix='/drivers', tags=['Drivers'])

@router.get('', response_model=List[DriverResponse])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).all()

@router.get('/me/trip', response_model=Optional[TripResponse])
def get_my_active_trip(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        # If user is admin/official, return the first active trip for preview
        active_trip = db.query(Trip).filter(Trip.status == TripStatus.IN_TRANSIT).first()
        return active_trip
    active_trip = db.query(Trip).filter(Trip.driver_id == driver.id, Trip.status == TripStatus.IN_TRANSIT).first()
    return active_trip

@router.get('/{id}', response_model=DriverResponse)
def get_driver(id: int, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post('', response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(payload: DriverCreate, db: Session = Depends(get_db)):
    driver = Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver
