import json
import secrets
from pathlib import Path

import qrcode

QR_CODES_DIR = Path(__file__).resolve().parent.parent.parent / "qr_codes"
QR_CODES_DIR.mkdir(exist_ok=True)


def generate_qr_token(length: int = 10) -> str:
    return secrets.token_urlsafe(length)[:length]


def generate_qr_image(book_copy_id: int, qr_code: str) -> str:
    payload = json.dumps({"book_copy_id": book_copy_id, "qr_code": qr_code})
    img = qrcode.make(payload)

    file_path = QR_CODES_DIR / f"{qr_code}.png"
    img.save(file_path)

    return f"/qr_codes/{qr_code}.png"
