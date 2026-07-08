from typing import List

from pydantic import BaseModel

from app.schemas.borrow import BorrowTransactionOut


class DashboardStats(BaseModel):
    total_books: int
    available_copies: int
    borrowed_copies: int
    overdue_count: int
    recent_activity: List[BorrowTransactionOut]
