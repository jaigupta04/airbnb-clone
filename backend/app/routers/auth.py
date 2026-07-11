from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.Token)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=auth.hash_password(payload.password),
        avatar_url=payload.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={payload.name}",
        is_host=payload.is_host,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token(user.id)
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token(user.id)
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(auth.get_current_user)):
    return user