from typing import Optional, List

from pydantic import BaseModel

from app.models.book_copy import CopyStatusEnum
from app.schemas.category import CategoryOut


class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    published_year: Optional[int] = None


class BookCreate(BookBase):
    category_id: int


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category_id: Optional[int] = None
    published_year: Optional[int] = None


class BookCopyOut(BaseModel):
    id: int
    book_id: int
    qr_code: str
    status: CopyStatusEnum

    model_config = {"from_attributes": True}


class BookOut(BookBase):
    id: int
    category: CategoryOut
    copies: List[BookCopyOut] = []

    model_config = {"from_attributes": True}
