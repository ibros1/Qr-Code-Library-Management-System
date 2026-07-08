from datetime import datetime, timedelta
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book_copy import BookCopy, CopyStatusEnum
from app.models.borrow_transaction import BorrowTransaction, TransactionStatusEnum
from app.models.fine import Fine
from app.models.user import User, RoleEnum
from app.schemas.borrow import BorrowRequest, ReturnRequest, BorrowTransactionOut
from app.utils.security import get_current_user

router = APIRouter(prefix="/borrow", tags=["borrow"])

BORROW_PERIOD_DAYS = 14
FINE_PER_DAY = Decimal("0.50")


@router.get("", response_model=List[BorrowTransactionOut])
def list_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(BorrowTransaction)
    if current_user.role != RoleEnum.Admin:
        query = query.filter(BorrowTransaction.user_id == current_user.id)
    return query.order_by(BorrowTransaction.borrow_date.desc()).all()


@router.post("/checkout", response_model=BorrowTransactionOut, status_code=status.HTTP_201_CREATED)
def checkout(payload: BorrowRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    copy = db.query(BookCopy).filter(BookCopy.qr_code == payload.qr_code).first()
    if not copy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book copy not found")
    if copy.status != CopyStatusEnum.Available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book copy is not available")

    if current_user.role == RoleEnum.Admin and payload.user_id:
        user = db.query(User).filter(User.id == payload.user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    else:
        # Members can only ever check out for themselves, regardless of what was submitted.
        user = current_user

    now = datetime.utcnow()
    transaction = BorrowTransaction(
        user_id=user.id,
        book_copy_id=copy.id,
        due_date=now + timedelta(days=BORROW_PERIOD_DAYS),
        status=TransactionStatusEnum.Borrowed,
    )
    copy.status = CopyStatusEnum.Borrowed

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post("/return", response_model=BorrowTransactionOut)
def return_book(payload: ReturnRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    copy = db.query(BookCopy).filter(BookCopy.qr_code == payload.qr_code).first()
    if not copy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book copy not found")

    transaction = (
        db.query(BorrowTransaction)
        .filter(
            BorrowTransaction.book_copy_id == copy.id,
            BorrowTransaction.status.in_([TransactionStatusEnum.Borrowed, TransactionStatusEnum.Overdue]),
        )
        .order_by(BorrowTransaction.borrow_date.desc())
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active borrow found for this copy")

    if current_user.role != RoleEnum.Admin and transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only return your own borrowed books")

    now = datetime.utcnow()
    transaction.return_date = now
    transaction.status = TransactionStatusEnum.Returned
    copy.status = CopyStatusEnum.Available

    due_date = transaction.due_date

    if now > due_date:
        days_late = (now - due_date).days + 1
        fine_amount = FINE_PER_DAY * days_late
        fine = Fine(borrow_transaction_id=transaction.id, amount=fine_amount, paid=False)
        db.add(fine)

    db.commit()
    db.refresh(transaction)
    return transaction
