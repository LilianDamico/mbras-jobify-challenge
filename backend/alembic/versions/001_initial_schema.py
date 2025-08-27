"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Criar schema jobify se não existir
    op.execute('CREATE SCHEMA IF NOT EXISTS jobify')
    
    # Tabela users
    op.create_table('users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        schema='jobify'
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=False, schema='jobify')
    
    # Tabela categories
    op.create_table('categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        schema='jobify'
    )
    op.create_index('ix_categories_slug', 'categories', ['slug'], unique=False, schema='jobify')
    
    # Tabela jobs
    op.create_table('jobs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('remotive_id', sa.String(length=120), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('url', sa.String(length=1024), nullable=True),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('raw', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['jobify.categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('remotive_id', name='uq_jobs_remotive_id'),
        schema='jobify'
    )
    op.create_index('ix_jobs_remotive_id', 'jobs', ['remotive_id'], unique=False, schema='jobify')
    
    # Tabela favorites
    op.create_table('favorites',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobify.jobs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['jobify.users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'job_id'),
        schema='jobify'
    )

def downgrade() -> None:
    op.drop_table('favorites', schema='jobify')
    op.drop_table('jobs', schema='jobify')
    op.drop_table('categories', schema='jobify')
    op.drop_table('users', schema='jobify')
    op.execute('DROP SCHEMA IF EXISTS jobify CASCADE')