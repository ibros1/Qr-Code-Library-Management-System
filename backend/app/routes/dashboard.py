from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.book_copy import BookCopy, CopyStatusEnum
from app.models.borrow_transaction import BorrowTransaction, TransactionStatusEnum
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_books = db.query(Book).count()
    available_copies = db.query(BookCopy).filter(BookCopy.status == CopyStatusEnum.Available).count()
    borrowed_copies = db.query(BookCopy).filter(BookCopy.status == CopyStatusEnum.Borrowed).count()

    now = datetime.utcnow()
    overdue_count = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.status == TransactionStatusEnum.Borrowed,
            BorrowTransaction.due_date < now,
        )
        .count()
    )

    recent_activity = (
        db.query(BorrowTransaction)
        .order_by(BorrowTransaction.borrow_date.desc())
        .limit(10)
        .all()
    )

    return DashboardStats(
        total_books=total_books,
        available_copies=available_copies,
        borrowed_copies=borrowed_copies,
        overdue_count=overdue_count,
        recent_activity=recent_activity,
    )
