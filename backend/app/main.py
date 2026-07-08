from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routes import auth, books, categories, users, borrow, fines, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="QR-Code Library Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QR_CODES_DIR = Path(__file__).resolve().parent.parent / "qr_codes"
QR_CODES_DIR.mkdir(exist_ok=True)
app.mount("/qr_codes", StaticFiles(directory=QR_CODES_DIR), name="qr_codes")

AVATARS_DIR = Path(__file__).resolve().parent.parent / "avatars"
AVATARS_DIR.mkdir(exist_ok=True)
app.mount("/avatars", StaticFiles(directory=AVATARS_DIR), name="avatars")

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(categories.router)
app.include_router(users.router)
app.include_router(borrow.router)
app.include_router(fines.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "QR-Code Library Management System API"}
