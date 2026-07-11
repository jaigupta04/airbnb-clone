import os
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
import jwt
from app.database import get_db
from sqlalchemy.orm import Session
from app import models

SECRET_KEY = "airbnb-clone-dev-secret-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7
ITERATIONS = 100_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        algo, iters, salt_hex, dk_hex = hashed.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(dk_hex)
        computed = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, int(iters))
        return hmac.compare_digest(computed, expected)
    except Exception:
        return False


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except Exception:
        return None


def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_optional_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
) -> Optional[models.User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()