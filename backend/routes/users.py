import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import User
    from security import require_roles, get_password_hash
    from provisioning import get_default_role_password
except ImportError:
    from backend.database import get_db
    from backend.models import User
    from backend.security import require_roles, get_password_hash
    from backend.provisioning import get_default_role_password

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

class UserCreateRequest(BaseModel):
    email: str
    fullName: str
    role: str  # 'school_admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'accountant'
    schoolId: Optional[str] = None
    password: Optional[str] = None

class UserUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    role: Optional[str] = None
    isActive: Optional[bool] = None
    mustChangePassword: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    schoolId: str
    status: str
    mustChangePassword: bool
    lastLogin: str

def serialize_user(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "name": u.full_name,
        "role": u.role,
        "schoolId": u.school_id,
        "status": "Active" if u.is_active else "Inactive",
        "mustChangePassword": u.must_change_password,
        "lastLogin": "Active now",
    }

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    school_id = payload.schoolId or (caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01")

    clean_email = payload.email.strip().lower()

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with email '{clean_email}' already exists.")

    raw_pwd = payload.password or get_default_role_password(payload.role, school_id)

    user = User(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        email=clean_email,
        full_name=payload.fullName.strip(),
        hashed_password=get_password_hash(raw_pwd),
        role=payload.role.strip().lower(),
        school_id=school_id,
        is_active=True,
        must_change_password=True,
        created_at=datetime.datetime.utcnow(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return serialize_user(user)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    if caller.get("role") != "super_admin" and user.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    if payload.fullName is not None:
        user.full_name = payload.fullName.strip()
    if payload.role is not None:
        user.role = payload.role.strip().lower()
    if payload.isActive is not None:
        user.is_active = payload.isActive
    if payload.mustChangePassword is not None:
        user.must_change_password = payload.mustChangePassword

    db.commit()
    db.refresh(user)
    return serialize_user(user)

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    if caller.get("role") != "super_admin" and user.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    user.is_active = False
    db.commit()

    return {"message": f"User account '{user.email}' deactivated successfully.", "id": user.id}
