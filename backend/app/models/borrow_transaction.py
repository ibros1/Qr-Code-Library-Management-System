import enum

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class TransactionStatusEnum(str, enum.Enum):
    Borrowed = "Borrowed"
    Returned = "Returned"
    Overdue = "Overdue"


class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_copy_id = Column(Integer, ForeignKey("book_copies.id"), nullable=False)
    borrow_date = Column(DateTime, server_default=func.now())
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(Enum(TransactionStatusEnum), nullable=False, default=TransactionStatusEnum.Borrowed)

    user = relationship("User", back_populates="borrow_transactions")
    book_copy = relationship("BookCopy", back_populates="borrow_transactions")
    fine = relationship("Fine", back_populates="borrow_transaction", uselist=False, cascade="all, delete-orphan")
