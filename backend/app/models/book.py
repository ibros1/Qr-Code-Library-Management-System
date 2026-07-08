from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(150), nullable=False)
    isbn = Column(String(30), unique=True, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    published_year = Column(Integer, nullable=True)

    category = relationship("Category", back_populates="books")
    copies = relationship("BookCopy", back_populates="book", cascade="all, delete-orphan")
