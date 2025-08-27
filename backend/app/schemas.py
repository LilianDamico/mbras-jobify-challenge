from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel


class JobOut(BaseModel):
    id: int  # Mudança de uuid.UUID para int
    remotive_id: str
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    posted_at: Optional[datetime] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class FavoriteIn(BaseModel):
    job_id: int  # Mudança de uuid.UUID para int
