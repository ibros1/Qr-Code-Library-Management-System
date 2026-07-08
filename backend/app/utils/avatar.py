import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

AVATARS_DIR = Path(__file__).resolve().parent.parent.parent / "avatars"
AVATARS_DIR.mkdir(exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_AVATAR_BYTES = 2 * 1024 * 1024


def save_avatar(file: UploadFile) -> str:
    extension = ALLOWED_CONTENT_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar must be a JPEG, PNG, or WEBP image",
        )

    contents = file.file.read()
    if len(contents) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar must be smaller than 2MB",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    (AVATARS_DIR / filename).write_bytes(contents)

    return f"/avatars/{filename}"


def delete_avatar(avatar_url: str | None) -> None:
    if not avatar_url:
        return
    filename = avatar_url.rsplit("/", 1)[-1]
    file_path = AVATARS_DIR / filename
    if file_path.exists() and file_path.is_relative_to(AVATARS_DIR):
        file_path.unlink(missing_ok=True)
