from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .config import settings
from .routes import auth_routes, project_routes, file_routes, version_routes, activity_routes
from .firebase_setup import init_firebase
from fastapi.staticfiles import StaticFiles
import os
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from .limiter import limiter

# Initialize Firebase
init_firebase()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# CORS middleware
origins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
if settings.FRONTEND_URL:
    origins.extend([url.strip() for url in settings.FRONTEND_URL.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers
app.include_router(auth_routes.router)
app.include_router(project_routes.router)
app.include_router(file_routes.router)
app.include_router(version_routes.router)
app.include_router(activity_routes.router)

# Ensure uploads directories exist
os.makedirs("uploads/avatars", exist_ok=True)

# Mount uploads directory for static files serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "ProjectVault API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
