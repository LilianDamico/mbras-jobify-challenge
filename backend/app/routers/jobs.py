# app/routers/jobs.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import APIRouter, HTTPException, Path, Query

router = APIRouter(prefix="/api", tags=["jobs"])



REMOTIVE_BASE = "https://remotive.com/api"
DEFAULT_HEADERS = {"User-Agent": "Jobify/1.0 (+https://github.com/)"}
DEFAULT_TIMEOUT = httpx.Timeout(20.0)

MAX_LIMIT = 200

async def _get_json(url_path: str, params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    GET no endpoint público da Remotive, retornando JSON
    ou disparando 502 em caso de erro.
    """
    try:
        async with httpx.AsyncClient(
            base_url=REMOTIVE_BASE,
            timeout=DEFAULT_TIMEOUT,
            headers=DEFAULT_HEADERS,
        ) as client:
            r = await client.get(url_path, params=params)
            r.raise_for_status()
            data = r.json() or {}
            if not isinstance(data, dict):
                raise ValueError("Resposta inválida (esperado objeto JSON).")
            return data
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Erro ao acessar Remotive: {exc}") from exc


def _normalize_job(j: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converte o item cru da Remotive para um formato estável para a UI.
    """
    raw_id = j.get("id") or j.get("job_id") or j.get("uuid") or j.get("slug") or j.get("url")
    job_id = str(raw_id) if raw_id is not None else ""

    return {
        "id": job_id,
        "remotive_id": str(j.get("id") or ""),
        "title": j.get("title") or "",
        "company": j.get("company_name"),
        "category": j.get("category"),
        "job_type": j.get("job_type"),
        "location": j.get("candidate_required_location"),
        "url": j.get("url"),
        "published_at": j.get("publication_date"), 
        "description": j.get("description"),
        "is_favorite": False,  
        "tags": j.get("tags") or j.get("skills") or [],
    }


def _extract_jobs_and_total(payload: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], int]:
    """
    A Remotive retorna normalmente {"jobs": [...], "job-count": <int>}.
    Toleramos pequenas variações.
    """
    jobs_raw = payload.get("jobs") or payload.get("data") or []
    total = payload.get("job-count") or payload.get("total") or len(jobs_raw)
    try:
        total_int = int(total)
    except Exception:  # noqa: BLE001
        total_int = len(jobs_raw)

    jobs = [_normalize_job(j) for j in jobs_raw if isinstance(j, dict)]
    return jobs, total_int


def _slice_page(items: List[Dict[str, Any]], page: int, per_page: int) -> List[Dict[str, Any]]:
    """
    Paginação local (a API pública não tem offset).
    """
    if page < 1:
        page = 1
    start = (page - 1) * per_page
    end = start + per_page
    return items[start:end]

@router.get("/jobs")
async def list_jobs(
    q: Optional[str] = Query(None, description="Texto de busca (search)"),
    category: Optional[str] = Query(
        None,
        description="Categoria (slug OU nome). Ex.: 'software-dev' ou 'Software Development'.",
    ),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
) -> Dict[str, Any]:
    """
    Lista vagas a partir da Remotive e devolve no formato estável:

    {
      "items": [Job, ...],
      "total": <int>,
      "page": <int>,
      "per_page": <int>,
      "total_pages": <int>
    }

    Observação: Remotive não suporta offset; usamos 'limit' e paginamos localmente.
    """
    
    limit = min(MAX_LIMIT, max(per_page * page, per_page))

    params: Dict[str, Any] = {"limit": limit}
    if q:
        params["search"] = q
    if category:
        params["category"] = category

    payload = await _get_json("/remote-jobs", params=params)
    all_items, total = _extract_jobs_and_total(payload)

    page_items = _slice_page(all_items, page, per_page)
    total_pages = max(1, (total + per_page - 1) // per_page)

    return {
        "items": page_items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: str = Path(..., description="ID retornado no campo 'id'/'remotive_id'"),
) -> Dict[str, Any]:
    """
    Busca uma vaga específica. A API pública não tem endpoint por ID;
    então buscamos um lote (limit alto) e filtramos localmente (best-effort).
    """
    
    payload = await _get_json("/remote-jobs", params={"limit": MAX_LIMIT})
    items, _ = _extract_jobs_and_total(payload)

    match = next((j for j in items if j["id"] == job_id or j.get("remotive_id") == job_id), None)
    if match:
        return match

    
    payload_all = await _get_json("/remote-jobs")
    items_all, _ = _extract_jobs_and_total(payload_all)
    match = next((j for j in items_all if j["id"] == job_id or j.get("remotive_id") == job_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Vaga não encontrada.")
    return match


@router.get("/categories")
async def list_categories() -> List[Dict[str, str]]:
    """
    Retorna categorias no formato:
      [{ "value": "<slug>", "label": "<nome>" }, ...]
    """
    payload = await _get_json("/remote-jobs/categories")
    raw = payload.get("jobs") or payload.get("categories") or payload.get("data") or []

    out: List[Dict[str, str]] = []
    for c in raw:
        if not isinstance(c, dict):
            continue
        
        slug = c.get("slug")
        name = c.get("name") or c.get("category") or slug
        if not name:
            continue
        slug_str = str(slug or name).strip()
        name_str = str(name).strip()
        out.append({"value": slug_str, "label": name_str})

    
    out.sort(key=lambda x: x["label"].lower())
    return out
