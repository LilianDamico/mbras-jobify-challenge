# app/main.py
from __future__ import annotations

from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Se seu settings tiver FRONTEND_URL / CORS_ORIGINS, usamos. Caso contrário,
# caímos nos padrões locais.
try:
    from .config import settings  # type: ignore
except Exception:  # pragma: no cover
    settings = None  # fallback simples

def _cors_origins() -> List[str]:
    defaults = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if not settings:
        return defaults
    origins: List[str] = []
    # FRONTEND_URL único (string)
    url = getattr(settings, "FRONTEND_URL", None)
    if isinstance(url, str) and url:
        origins.append(url.rstrip("/"))
    # CORS_ORIGINS lista/tupla
    extra = getattr(settings, "CORS_ORIGINS", None)
    if isinstance(extra, (list, tuple)):
        origins.extend(str(o).rstrip("/") for o in extra if o)
    # garante padrões locais
    for o in defaults:
        if o not in origins:
            origins.append(o)
    return origins

# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Jobify API (FastAPI)",
    version="1.0.0",
)

# Compressão de respostas textuais
app.add_middleware(GZipMiddleware, minimum_size=1024)

# CORS – permite o frontend Next.js acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from .routers import jobs, favorites  # noqa: E402

app.include_router(jobs.router)
app.include_router(favorites.router)

# -----------------------------------------------------------------------------
# Health / root
# -----------------------------------------------------------------------------
@app.get("/healthz", tags=["infra"])
async def healthz():
    return {"status": "ok"}

@app.get("/", tags=["infra"])
async def root():
    return {"name": "Jobify API", "docs": "/docs", "health": "/healthz"}
