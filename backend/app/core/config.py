import os
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, 'nerlogix.db').replace('\\', '/')

class Settings(BaseSettings):
    PROJECT_NAME: str = 'NER-LOGIX Accessibility Intelligence'
    VERSION: str = '1.0.0'
    API_V1_STR: str = '/api'
    
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = f'sqlite:///{DEFAULT_DB_PATH}'
    
    UPLOAD_DIR: str = os.path.join(BASE_DIR, 'uploads').replace('\\', '/')
    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ORIGINS: List[str] = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://ner-logix-frontend-6rdr.onrender.com'
]
    
    class Config:
        case_sensitive = True

settings = Settings()

