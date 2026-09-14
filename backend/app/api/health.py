from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(tags=['Health'])

@router.get('/health')
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
        
    return {
        'status': 'healthy',
        'platform': 'NER-LOGIX Accessibility Intelligence',
        'region': 'North Eastern Region of India',
        'database': db_status
    }
