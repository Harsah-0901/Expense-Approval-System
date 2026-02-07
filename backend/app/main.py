"""ExpenseFlow API - Main application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import get_settings
from app.database import init_db
from app.routers import auth, expenses, approvals, reports, users, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    upload_dir = get_settings().UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    app.mount("/api/uploads", StaticFiles(directory=upload_dir), name="uploads")
    yield


app = FastAPI(
    title="ExpenseFlow API",
    description="Production-style Expense Approval System API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(export.router, prefix="/api")

# Serve uploaded receipts (mounted after startup when dir exists)
# Note: StaticFiles for uploads is set up in lifespan


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "expenseflow-api"}


@app.get("/")
async def root():
    """API root."""
    return {
        "message": "ExpenseFlow API",
        "docs": "/docs",
        "health": "/health",
    }
