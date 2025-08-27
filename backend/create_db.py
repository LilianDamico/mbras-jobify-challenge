import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

from app.models import Base
from app.config import settings


async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        print(">> Criando tabelas no banco...")
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        print(">> Tabelas criadas com sucesso!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
