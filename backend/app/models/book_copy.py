import enum

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class CopyStatusEnum(str, enum.Enum):
    Available = "Available"
    Borrowed = "Borrowed"


class BookCopy(Base):
    __tablename__ = "book_copies"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    qr_code = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(Enum(CopyStatusEnum), nullable=False, default=CopyStatusEnum.Available)

    book = relationship("Book", back_populates="copies")
    borrow_transactions = relationship("BorrowTransaction", back_populates="book_copy")
