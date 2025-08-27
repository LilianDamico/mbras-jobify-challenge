from __future__ import annotations

import os
import sys
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

# --- deixar "app" importável ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# importa settings e metadata do projeto
from app.config import settings
from app.models import Base  # target_metadata

# Config Alembic
config = context.config

# injeta a URL do banco vinda do .env (Render)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# metadata para autogenerate
target_metadata = Base.metadata

SCHEMA_NAME = "jobify"


def run_migrations_offline() -> None:
    """Gera SQL sem abrir conexão."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema=SCHEMA_NAME,
        compare_type=True,
        compare_server_default=True,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Roda migrations conectado (async), usando run_sync para evitar erro de inspect."""
    connectable: AsyncEngine = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
        future=True,
    )

    async def do_run_migrations() -> None:
        async with connectable.connect() as async_conn:

            # garante o schema antes de configurar o contexto
            await async_conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA_NAME}"'))

            def run_sync_migrations(sync_conn: Connection) -> None:
                context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    include_schemas=True,
                    version_table_schema=SCHEMA_NAME,
                    compare_type=True,
                    compare_server_default=True,
                    render_as_batch=False,
                )
                with context.begin_transaction():
                    context.run_migrations()

            # chama a função sync no contexto da conexão async
            await async_conn.run_sync(run_sync_migrations)

        await connectable.dispose()

    asyncio.run(do_run_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
