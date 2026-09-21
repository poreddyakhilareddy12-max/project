"""
ASTRA-SAFE: AI-Based Asteroid Hazard Classification & Monitoring Platform
FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.endpoints import router
from app.services.ml_service import ml_service
from app.services.asteroid_db import asteroid_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load model and database into memory
    print("[ASTRA-SAFE] Initializing ML models and database services...")
    ml_service.load_artifacts()
    asteroid_db.load_data()
    print("[ASTRA-SAFE] Backend initialization complete.")
    yield
    print("[ASTRA-SAFE] Shutting down backend services.")


app = FastAPI(
    title="ASTRA-SAFE: AI Asteroid Hazard Intelligence API",
    description="High-precision machine learning classification and preliminary hazard screening platform for Near-Earth Objects.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production safe default for local/hosted frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(router)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=422,
        content={"detail": f"Input validation error: {str(exc)}"}
    )


@app.get("/")
async def root():
    return {
        "platform": "ASTRA-SAFE",
        "tagline": "AI-Based Asteroid Hazard Classification & Monitoring Platform",
        "status": "Operational",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
