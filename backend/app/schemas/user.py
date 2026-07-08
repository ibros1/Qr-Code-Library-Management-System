from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.user import RoleEnum


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.Member


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
