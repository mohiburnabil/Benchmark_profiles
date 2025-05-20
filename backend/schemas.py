# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class ResultOut(BaseModel):
    id: int
    score: float
    uploaded_at: datetime

    class Config:
        orm_mode = True
