from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.borrow import BorrowTransactionOut


class FineOut(BaseModel):
    id: int
    borrow_transaction_id: int
    amount: Decimal
    paid: bool
    borrow_transaction: Optional[BorrowTransactionOut] = None

    model_config = {"from_attributes": True}
