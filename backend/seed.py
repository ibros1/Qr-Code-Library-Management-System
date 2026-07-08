import os

from dotenv import load_dotenv

from app.database import Base, engine, SessionLocal
from app.models.user import User, RoleEnum
from app.models.category import Category
from app.utils.security import hash_password

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_FULL_NAME = os.getenv("ADMIN_FULL_NAME", "System Admin")

DEFAULT_CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography"]


def seed_admin(db):
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        print(f"Admin user '{ADMIN_EMAIL}' already exists. Skipping.")
        return

    admin = User(
        full_name=ADMIN_FULL_NAME,
        email=ADMIN_EMAIL,
        password=hash_password(ADMIN_PASSWORD),
        role=RoleEnum.Admin,
    )
    db.add(admin)
    db.commit()
    print(f"Admin user created: {ADMIN_EMAIL}")


def seed_categories(db):
    existing_names = {c.name for c in db.query(Category).all()}
    created = 0
    for name in DEFAULT_CATEGORIES:
        if name not in existing_names:
            db.add(Category(name=name))
            created += 1
    db.commit()
    print(f"Seeded {created} default categories (skipped {len(DEFAULT_CATEGORIES) - created} existing).")


def seed():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_admin(db)
        seed_categories(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
