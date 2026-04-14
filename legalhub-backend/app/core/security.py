from datetime import datetime, timedelta
import hashlib, base64
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _pre_hash(password: str) -> str:
    """SHA-256 pre-hash to bypass bcrypt's 72-byte limit."""
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest).decode("utf-8")

def hash_password(password: str) -> str:
    return pwd_context.hash(_pre_hash(password))

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_pre_hash(plain), hashed)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload["type"] = "access"
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload["type"] = "refresh"
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_2fa_pending_token(user_id: str) -> str:
    """Short-lived token issued when login requires 2FA verification."""
    payload = {
        "sub": user_id,
        "type": "2fa_pending",
        "exp": datetime.utcnow() + timedelta(minutes=5),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None