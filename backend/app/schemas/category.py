from typing import Optional

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int

    model_config = {"from_attributes": True}
