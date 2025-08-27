# app/services/sync.py
from __future__ import annotations

from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.remotive import fetch_remotive_jobs
# Se você quiser persistir no banco, você pode importar seus modelos e fazer upsert aqui.
# from app.models import Job
# from sqlalchemy.dialects.postgresql import insert as pg_insert

async def sync_jobs_from_remotive(
    session: AsyncSession,
    *,
    q: Optional[str],
    category: Optional[str],
    page: int,
    per_page: int,
) -> Dict[str, Any]:
    """
    Busca na Remotive e (opcionalmente) persiste. Por ora, retorna direto os dados
    para garantir o fluxo funcionando sem erro de import/persistência.
    """
    data = await fetch_remotive_jobs(q=q, category=category, page=page, per_page=per_page)

    # --- Exemplo de persistência (deixe comentado até querer usar) ---
    # for item in data["items"]:
    #     stmt = pg_insert(Job).values(
    #         remotive_id=item["remotive_id"],
    #         title=item["title"],
    #         company=item["company"],
    #         location=item["location"],
    #         url=item["url"],
    #         published_at=item["published_at"],
    #         raw=item["raw"],
    #         category=item["category"],
    #     ).on_conflict_do_update(
    #         index_elements=[Job.remotive_id],
    #         set_={
    #             "title": item["title"],
    #             "company": item["company"],
    #             "location": item["location"],
    #             "url": item["url"],
    #             "published_at": item["published_at"],
    #             "raw": item["raw"],
    #             "category": item["category"],
    #         },
    #     )
    #     await session.execute(stmt)
    # await session.commit()

    return data
