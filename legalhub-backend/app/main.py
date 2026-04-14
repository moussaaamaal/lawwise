from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.scheduler import start_scheduler
from app.routers import (
    auth, cases, clients, documents, billing,
    calendar, ai, notifications, tasks, firm, payments, dashboard,
    client_portal,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = start_scheduler()
    yield
    scheduler.shutdown()

app = FastAPI(
    title="LegalHub API",
    version="2.0.0",
    description="Legal Practice Management Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:4200",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(cases.router)
app.include_router(clients.router)
app.include_router(documents.router)
app.include_router(billing.router)
app.include_router(calendar.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(firm.router)
app.include_router(payments.router)
app.include_router(client_portal.router)

# ─── Health ────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"message": "LegalHub API v2.0", "status": "running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
