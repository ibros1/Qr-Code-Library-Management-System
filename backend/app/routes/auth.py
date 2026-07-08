from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UpdateMeRequest
from app.schemas.user import UserOut
from app.utils.avatar import delete_avatar, save_avatar
from app.utils.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Self-registration always creates a Member — promoting to Admin is an
    # admin-only action via the Members page, never something a signup form can do.
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password=hash_password(payload.password),
        role=RoleEnum.Member,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UpdateMeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("password"):
        data["password"] = hash_password(data["password"])
    else:
        data.pop("password", None)

    for field, value in data.items():
        setattr(current_user, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserOut)
def upload_my_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_avatar_url = save_avatar(file)
    old_avatar_url = current_user.avatar_url

    current_user.avatar_url = new_avatar_url
    db.commit()
    db.refresh(current_user)

    delete_avatar(old_avatar_url)
    return current_user


@router.delete("/me/avatar", response_model=UserOut)
def remove_my_avatar(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_avatar(current_user.avatar_url)
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)
    return current_user
