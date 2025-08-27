# arquivo: app/models.py
from __future__ import annotations

from typing import Optional, List
from datetime import datetime

from sqlalchemy import (
    String, Text, DateTime, ForeignKey, Integer, func, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base  # <-- pega o Base daqui (sem import circular)


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "jobify"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"schema": "jobify"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)

    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="category")


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("remotive_id", name="uq_jobs_remotive_id"),
        {"schema": "jobify"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    remotive_id: Mapped[Optional[str]] = mapped_column(String(120), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("jobify.categories.id"), nullable=True)
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="jobs")

    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="job", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = ({"schema": "jobify"},)

    # chave composta (user_id, job_id)
    user_id: Mapped[int] = mapped_column(ForeignKey("jobify.users.id"), primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobify.jobs.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="favorites")
    job: Mapped["Job"] = relationship("Job", back_populates="favorites")
