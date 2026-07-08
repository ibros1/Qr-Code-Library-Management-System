from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.book_copy import BookCopy
from app.models.borrow_transaction import BorrowTransaction
from app.models.category import Category
from app.models.user import User
from app.schemas.book import BookCreate, BookUpdate, BookOut, BookCopyOut
from app.utils.security import get_current_user, require_admin
from app.utils.qr_generator import generate_qr_token, generate_qr_image

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=List[BookOut])
def list_books(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Book).all()


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(payload: BookCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    book = Book(**payload.model_dump())
    db.add(book)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ISBN already exists")
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data:
        category = db.query(Category).filter(Category.id == data["category_id"]).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for field, value in data.items():
        setattr(book, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ISBN already exists")
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    has_history = (
        db.query(BorrowTransaction)
        .join(BookCopy)
        .filter(BookCopy.book_id == book_id)
        .first()
    )
    if has_history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a book with borrow history",
        )

    db.delete(book)
    db.commit()
    return None


@router.post("/{book_id}/copies", response_model=BookCopyOut, status_code=status.HTTP_201_CREATED)
def generate_copy(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    qr_code = generate_qr_token()
    copy = BookCopy(book_id=book.id, qr_code=qr_code)
    db.add(copy)
    db.commit()
    db.refresh(copy)

    generate_qr_image(copy.id, copy.qr_code)

    return copy


@router.get("/{book_id}/copies", response_model=List[BookCopyOut])
def list_copies(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book.copies


@router.delete("/copies/{copy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_copy(copy_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    copy = db.query(BookCopy).filter(BookCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book copy not found")

    has_history = db.query(BorrowTransaction).filter(BorrowTransaction.book_copy_id == copy_id).first()
    if has_history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a book copy with borrow history",
        )

    db.delete(copy)
    db.commit()
    return None
