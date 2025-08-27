# app/services/remotive.py
from __future__ import annotations

from typing import Any, Dict, List, Optional
import httpx


_BASE_URLS = [
    "https://remotive.com/api/remote-jobs",
    "https://remotive.io/api/remote-jobs",
]


async def fetch_remotive_jobs(
    q: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Busca vagas diretamente na API pública da Remotive e normaliza alguns campos.
    Retorna um dicionário com items/total/page/per_page/total_pages.
    """
    params: Dict[str, Any] = {}
    if q:
        params["search"] = q
    if category:
        params["category"] = category
    if page:
        params["page"] = page
    if per_page:
        params["limit"] = per_page

    last_err: Optional[Exception] = None
    payload: Dict[str, Any] = {}

    async with httpx.AsyncClient(timeout=20.0, headers={"User-Agent": "Jobify/1.0"}) as client:
        for url in _BASE_URLS:
            try:
                resp = await client.get(url, params=params)
                
                if resp.status_code == 200:
                    payload = resp.json()
                    break
                last_err = RuntimeError(f"Remotive respondeu {resp.status_code} em {url}")
            except Exception as exc:
                last_err = exc
        else:
            
            raise RuntimeError(f"Falha ao consultar Remotive: {last_err}") from last_err

    jobs: List[Dict[str, Any]] = payload.get("jobs", []) or []
    items: List[Dict[str, Any]] = []
    for j in jobs:
        items.append(
            {
                "remotive_id": str(j.get("id") or ""),
                "title": j.get("title"),
                "company": j.get("company_name"),
                "location": j.get("candidate_required_location"),
                "url": j.get("url"),
                "published_at": j.get("publication_date"),
                "category": j.get("category"),
                "job_type": j.get("job_type"),
                "tags": j.get("tags") or [],
                "raw": j,  
            }
        )

    total = (
        payload.get("job-count")
        or payload.get("total")
        or len(items)
    )
    
    total_pages = payload.get("total_pages")
    if not total_pages and per_page:
        total_pages = (total + per_page - 1) // per_page

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages or 1,
    }
