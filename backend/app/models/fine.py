from sqlalchemy import Column, Integer, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Fine(Base):
    __tablename__ = "fines"

    id = Column(Integer, primary_key=True, index=True)
    borrow_transaction_id = Column(Integer, ForeignKey("borrow_transactions.id"), nullable=False, unique=True)
    amount = Column(Numeric(6, 2), nullable=False)
    paid = Column(Boolean, nullable=False, default=False)

    borrow_transaction = relationship("BorrowTransaction", back_populates="fine")
