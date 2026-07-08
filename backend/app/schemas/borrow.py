from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.borrow_transaction import TransactionStatusEnum
from app.schemas.user import UserOut
from app.schemas.book import BookCopyOut


class BorrowRequest(BaseModel):
    qr_code: str
    # Ignored for Members — the server always uses the authenticated user's own id.
    # Only Admins may check a book out on behalf of someone else.
    user_id: Optional[int] = None


class ReturnRequest(BaseModel):
    qr_code: str


class BorrowTransactionOut(BaseModel):
    id: int
    user_id: int
    book_copy_id: int
    borrow_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: TransactionStatusEnum
    user: Optional[UserOut] = None
    book_copy: Optional[BookCopyOut] = None

    model_config = {"from_attributes": True}
