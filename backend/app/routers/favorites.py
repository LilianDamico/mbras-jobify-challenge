# app/routers/favorites.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, delete, insert
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..models import Favorite, Job
from ..schemas import JobOut, FavoriteIn

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


DEMO_USER = 1


@router.get("", response_model=List[JobOut])
async def list_favorites(session: AsyncSession = Depends(get_session)):
    """
    Lista todas as vagas favoritas do usuário.
    """
    q = (
        select(Job)
        .join(Favorite, Favorite.job_id == Job.id)
        .where(Favorite.user_id == DEMO_USER)
        .order_by(Favorite.created_at.desc())
    )
    rows = await session.execute(q)
    return [JobOut.model_validate(job) for job in rows.scalars().all()]


@router.post("", status_code=201)
async def add_favorite(
    payload: FavoriteIn, session: AsyncSession = Depends(get_session)
):
    """
    Adiciona uma vaga aos favoritos.
    """
    
    exists = await session.get(Job, payload.job_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")

    
    await session.execute(
        insert(Favorite)
        .values(user_id=DEMO_USER, job_id=payload.job_id)
        .prefix_with("ON CONFLICT DO NOTHING")
    )
    await session.commit()
    
    return {"message": "Vaga adicionada aos favoritos", "job_id": payload.job_id}


@router.delete("/{job_id}", status_code=204, response_class=Response)
async def remove_favorite(
    job_id: int, session: AsyncSession = Depends(get_session)
) -> Response:
    """
    Remove uma vaga dos favoritos.
    Retorna 204 No Content SEM corpo.
    """
    result = await session.execute(
        delete(Favorite).where(
            Favorite.user_id == DEMO_USER,
            Favorite.job_id == job_id,
        )
    )
    await session.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorito não encontrado")


    return Response(status_code=204)


@router.get("/check/{job_id}")
async def check_favorite(job_id: int, session: AsyncSession = Depends(get_session)):
    """
    Verifica se uma vaga está nos favoritos.
    """
    result = await session.execute(
        select(Favorite).where(
            Favorite.user_id == DEMO_USER,
            Favorite.job_id == job_id,
        )
    )
    is_favorite = result.scalar_one_or_none() is not None
    return {"is_favorite": is_favorite, "job_id": job_id}
