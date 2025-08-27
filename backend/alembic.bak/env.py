# alembic/env.py
from __future__ import annotations

import os
import sys
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.ext.asyncio import async_engine_from_config

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.config import settings
from app.models import Base

config = context.config
SCHEMA_NAME = "jobify"

# URL do .env (já com postgresql+asyncpg e search_path via options)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def include_object(obj, name, type_, reflected, compare_to):
    """
    Inclui só objetos do schema 'jobify'. Evita que o autogenerate
    enxergue tabelas de outras aplicações (ex.: schema 'public').
    """
    if type_ in {"table", "index"}:
        schema = getattr(obj, "schema", None)
        if schema is None and reflected and hasattr(obj, "table"):
            schema = getattr(obj.table, "schema", None)
        return schema == SCHEMA_NAME
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        include_schemas=True,
        include_object=include_object,
        version_table_schema=SCHEMA_NAME,
        compare_type=True,
        compare_server_default=True,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section) or {},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    async def async_main() -> None:
        async with connectable.connect() as async_conn:
            # garante o schema
            await async_conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA_NAME}"'))

            def do_migrations(sync_conn):
                context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    include_schemas=True,
                    include_object=include_object,
                    version_table_schema=SCHEMA_NAME,
                    compare_type=True,
                    compare_server_default=True,
                    render_as_batch=False,
                )
                with context.begin_transaction():
                    context.run_migrations()

            await async_conn.run_sync(do_migrations)

        await connectable.dispose()

    asyncio.run(async_main())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
