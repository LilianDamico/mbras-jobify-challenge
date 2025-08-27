# app/db.py
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

metadata_obj = MetaData(schema="jobify")

class Base(DeclarativeBase):
    metadata = metadata_obj

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=0,
    pool_recycle=300,
    pool_pre_ping=True,
    connect_args={
        "server_settings": {
            "search_path": "jobify"
        }
    },
)

SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with SessionLocal() as s:
        yield s
