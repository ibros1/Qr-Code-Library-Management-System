import enum

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class RoleEnum(str, enum.Enum):
    Admin = "Admin"
    Member = "Member"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.Member)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    borrow_transactions = relationship("BorrowTransaction", back_populates="user")
