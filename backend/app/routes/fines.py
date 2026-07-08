from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.fine import Fine
from app.models.borrow_transaction import BorrowTransaction
from app.models.user import User, RoleEnum
from app.schemas.fine import FineOut
from app.utils.security import get_current_user, require_admin

router = APIRouter(prefix="/fines", tags=["fines"])


@router.get("", response_model=List[FineOut])
def list_fines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Fine)
    if current_user.role != RoleEnum.Admin:
        query = query.join(BorrowTransaction).filter(BorrowTransaction.user_id == current_user.id)
    return query.all()


@router.put("/{fine_id}/pay", response_model=FineOut)
def mark_paid(fine_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fine not found")
    fine.paid = True
    db.commit()
    db.refresh(fine)
    return fine
