import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routes import auth, articles

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create data directory if needed
    os.makedirs("data", exist_ok=True)
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Pocket App API",
    description="Self-hostable read-it-later application",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(articles.router, prefix="/api/articles", tags=["articles"])


@app.get("/health")
def health_check():
    return {"status": "healthy"}
