import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Request, HTTPException, status

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        raise RuntimeError("CRITICAL: JWT_SECRET_KEY environment variable is missing in production!")
    # Development fallback
    SECRET_KEY = "dev_secret_key_change_in_production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
IMPERSONATION_TOKEN_EXPIRE_MINUTES = 30

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_acting_caller(request: Request) -> Optional[dict]:
    """
    Decodes bearer JWT from incoming Request headers and extracts acting caller info.
    Accounts for active impersonation sessions (effective role is impersonated user's role).
    """
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id")
    email = payload.get("sub")
    role = payload.get("role")
    school_id = payload.get("school_id") or payload.get("tenant_id")
    impersonated_by_id = payload.get("impersonated_by")

    return {
        "user_id": user_id,
        "email": email,
        "role": role,
        "school_id": school_id,
        "impersonated_by_id": impersonated_by_id,
        "impersonated_by_email": payload.get("impersonated_by_email"),
        "session_id": payload.get("impersonation_session_id"),
    }

def require_roles(*allowed_roles: str):
    """
    Reusable FastAPI dependency factory for backend-side RBAC permission enforcement.
    Decodes JWT token, raises HTTP 401 if missing/invalid token,
    and raises HTTP 403 if the effective caller role is not in allowed_roles.
    """
    def dependency(request: Request) -> dict:
        caller = get_acting_caller(request)
        if not caller or not caller.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token required.",
            )

        acting_role = caller.get("role")
        if allowed_roles and acting_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Role '{acting_role}' is not authorized for this resource.",
            )
        return caller
    return dependency
