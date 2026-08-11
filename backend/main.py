import os
import sys
import datetime
import secrets
import uuid
from fastapi import FastAPI, Depends, HTTPException, Header, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

# Ensure current directory is in Python path for direct execution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import get_db, SessionLocal, engine, Base
    from models import User, Tenant, PasswordResetAudit, ImpersonationAudit
    from security import (
        verify_password,
        get_password_hash,
        create_access_token,
        decode_access_token,
        get_acting_caller,
        require_roles,
        IMPERSONATION_TOKEN_EXPIRE_MINUTES,
    )
    from seed import seed_database
    from routes.tenants import router as tenants_router
    from routes.students import router as students_router
    from routes.teachers import router as teachers_router
    from routes.attendance import router as attendance_router
    from routes.homework import router as homework_router
    from routes.results import router as results_router
    from routes.fees import router as fees_router
    from routes.users import router as users_router
    from routes.analytics import router as analytics_router
    from routes.announcements import router as announcements_router
    from routes.schedules import router as schedules_router
except ImportError:
    from backend.database import get_db, SessionLocal, engine, Base
    from backend.models import User, Tenant, PasswordResetAudit, ImpersonationAudit
    from backend.security import (
        verify_password,
        get_password_hash,
        create_access_token,
        decode_access_token,
        get_acting_caller,
        require_roles,
        IMPERSONATION_TOKEN_EXPIRE_MINUTES,
    )
    from backend.seed import seed_database
    from backend.routes.tenants import router as tenants_router
    from backend.routes.students import router as students_router
    from backend.routes.teachers import router as teachers_router
    from backend.routes.attendance import router as attendance_router
    from backend.routes.homework import router as homework_router
    from backend.routes.results import router as results_router
    from backend.routes.fees import router as fees_router
    from backend.routes.users import router as users_router
    from backend.routes.analytics import router as analytics_router
    from backend.routes.announcements import router as announcements_router
    from backend.routes.schedules import router as schedules_router

# Initialize Database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for SQLite dev database
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE homework ADD COLUMN is_active BOOLEAN DEFAULT 1;"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE homework ADD COLUMN deleted_at DATETIME NULL;"))
    except Exception:
        pass
    conn.commit()

# Ensure super_admin user always exists on app startup
db_session = SessionLocal()
try:
    sa = db_session.query(User).filter(User.role == "super_admin").first()
    if not sa:
        sa_user = User(
            id="usr_superadmin",
            email="superadmin@amps.edu",
            full_name="Super Administrator",
            hashed_password=get_password_hash("superadmin"),
            role="super_admin",
            school_id="platform",
            is_active=True,
            must_change_password=False,
        )
        db_session.add(sa_user)
        db_session.commit()
except Exception as e:
    db_session.rollback()
finally:
    db_session.close()

app = FastAPI(
    title="School Portal API",
    version="1.0.0",
    description="Multi-Tenant SaaS API for School Management System"
)

# Enable CORS for Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(tenants_router)
app.include_router(students_router)
app.include_router(teachers_router)
app.include_router(attendance_router)
app.include_router(homework_router)
app.include_router(results_router)
app.include_router(fees_router)
app.include_router(users_router)
app.include_router(analytics_router)
app.include_router(announcements_router)
app.include_router(schedules_router)

# Pydantic Schemas
class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str

# API Endpoints
@app.get("/")
def read_root():
    return {
        "message": "Welcome to School Portal Production API",
        "status": "online",
        "system": "Multi-Tenant SaaS",
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "database": "connected"}

# User Listing Endpoint with Optional ?school_id= Filter (Requires Authentication & Scoped Access)
@app.get("/api/v1/users")
def list_users(
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "chairman", "teacher", "accountant")),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if caller.get("role") != "super_admin":
        # Force non-super_admin callers to only see their own school's users, EXCLUDING platform super_admin
        query = query.filter(User.school_id == caller["school_id"]).filter(User.role != "super_admin")
    elif school_id:
        # If filtering by specific school ID, exclude platform super_admin
        query = query.filter(User.school_id == school_id.strip().lower()).filter(User.role != "super_admin")

    users = query.all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.full_name,
            "role": u.role,
            "schoolId": u.school_id,
            "status": "Active" if u.is_active else "Inactive",
            "mustChangePassword": u.must_change_password,
            "lastLogin": "Active now",
        }
        for u in users
    ]

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    header_tenant_id = request.headers.get("x-tenant-id")

    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact school admin.",
        )

    # Validate user belongs to tenant resolved from request header (except super_admin)
    if header_tenant_id and user.role != "super_admin":
        if user.school_id.lower() != header_tenant_id.strip().lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User does not belong to school tenant '{header_tenant_id}'.",
            )

    target_tenant_id = user.school_id
    tenant = db.query(Tenant).filter(Tenant.id == target_tenant_id).first()
    if tenant and not tenant.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"School tenant '{target_tenant_id}' is currently suspended or inactive.",
        )

    effective_role = user.role

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": effective_role,
            "tenant_id": user.school_id,
            "school_id": user.school_id
        }
    )

    user_dict = {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": effective_role,
        "schoolId": user.school_id,
        "mustChangePassword": user.must_change_password,
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
    }

@app.get("/api/v1/auth/me")
def get_current_user(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    email = payload["sub"]
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role,
        "schoolId": user.school_id,
        "mustChangePassword": user.must_change_password,
        "impersonatedBy": payload.get("impersonated_by"),
    }

@app.post("/api/v1/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user:
        return {"message": "If that email exists in our system, password reset instructions have been dispatched."}

    reset_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "purpose": "reset",
            "iat": int(datetime.datetime.utcnow().timestamp())
        },
        expires_delta=datetime.timedelta(minutes=15)
    )

    reset_url = f"/reset-password?token={reset_token}"

    # TODO: In production, send resetUrl via Email Service (e.g. SendGrid / AWS SES / SMTP).

    return_link = os.getenv("RETURN_RESET_LINK_IN_RESPONSE", "true").lower() == "true" or os.getenv("ENVIRONMENT", "development").lower() == "development"

    response_data = {
        "message": "If that email exists in our system, password reset instructions have been dispatched.",
    }
    if return_link:
        response_data["resetUrl"] = reset_url
        response_data["resetToken"] = reset_token

    return response_data

# PART A: Self-Service Password Reset with Audit Trail
@app.post("/api/v1/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_payload = decode_access_token(payload.token)
    if not token_payload or token_payload.get("purpose") != "reset" or "sub" not in token_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    email = token_payload["sub"]
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    token_iat = token_payload.get("iat")
    if token_iat and user.password_changed_at:
        pwd_changed_ts = int(user.password_changed_at.timestamp())
        if pwd_changed_ts > token_iat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This password reset token has already been used or invalidated."
            )

    user.hashed_password = get_password_hash(payload.new_password)
    user.must_change_password = False
    user.password_changed_at = datetime.datetime.utcnow()

    # AUDIT TRAIL: Record PasswordResetAudit for self-service reset
    audit_entry = PasswordResetAudit(
        id=f"audit_pwd_{uuid.uuid4().hex[:12]}",
        school_id=user.school_id,
        target_user_id=user.id,
        target_email=user.email,
        target_role=user.role,
        reset_type="self_service",
        performed_by_user_id=None,
        performed_by_role=None,
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit_entry)
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}

@app.post("/api/v1/auth/change-password")
def change_password(
    payload: ChangePasswordRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "chairman", "teacher", "student", "parent", "accountant", "reception")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == caller["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.current_password and not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    user.hashed_password = get_password_hash(payload.new_password)
    user.must_change_password = False
    user.password_changed_at = datetime.datetime.utcnow()

    # Record Audit
    performing_admin_id = caller.get("impersonated_by_id") or caller.get("user_id")
    performing_admin_role = "super_admin" if caller.get("impersonated_by_id") else caller.get("role")
    audit_entry = PasswordResetAudit(
        id=f"audit_pwd_{uuid.uuid4().hex[:12]}",
        school_id=user.school_id,
        target_user_id=user.id,
        target_email=user.email,
        target_role=user.role,
        reset_type="self_service",
        performed_by_user_id=performing_admin_id,
        performed_by_role=performing_admin_role,
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit_entry)
    db.commit()

    return {"message": "Password updated successfully."}

# PART A: Admin Forced Password Reset with Audit Trail
@app.post("/api/v1/users/{user_id}/admin-reset-password")
def admin_reset_password(
    user_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    try:
        from provisioning import get_default_role_password
    except ImportError:
        from backend.provisioning import get_default_role_password
    new_password = get_default_role_password(user.role, user.school_id)

    user.hashed_password = get_password_hash(new_password)
    user.must_change_password = False
    user.password_changed_at = datetime.datetime.utcnow()

    # Determine real performing actor (accounting for active impersonation)
    acting_user_id = caller.get("impersonated_by_id") or caller.get("user_id")
    acting_role = "super_admin" if caller.get("impersonated_by_id") else caller.get("role")

    # AUDIT TRAIL: Record PasswordResetAudit for admin forced reset
    audit_entry = PasswordResetAudit(
        id=f"audit_pwd_{uuid.uuid4().hex[:12]}",
        school_id=user.school_id,
        target_user_id=user.id,
        target_email=user.email,
        target_role=user.role,
        reset_type="admin_forced",
        performed_by_user_id=acting_user_id,
        performed_by_role=acting_role,
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit_entry)
    db.commit()

    # CRITICAL: Plaintext password returned ONCE to the acting admin only
    return {
        "message": f"Password reset for {user.full_name}.",
        "userId": user.id,
        "userEmail": user.email,
        "newPassword": new_password,
    }

# PART B: Super Admin Passwordless Impersonation Endpoint
@app.post("/api/v1/auth/impersonate/{target_user_id}")
def start_impersonation(
    target_user_id: str,
    caller: dict = Depends(require_roles("super_admin")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user '{target_user_id}' not found.")

    session_id = f"session_imp_{uuid.uuid4().hex[:12]}"

    # Insert ImpersonationAudit row
    imp_audit = ImpersonationAudit(
        id=session_id,
        super_admin_user_id=caller["user_id"],
        super_admin_email=caller["email"],
        target_user_id=target_user.id,
        target_email=target_user.email,
        target_school_id=target_user.school_id,
        started_at=datetime.datetime.utcnow(),
    )
    db.add(imp_audit)
    db.commit()

    # Issue 30-minute JWT for target user with impersonation claims
    impersonation_token = create_access_token(
        data={
            "sub": target_user.email,
            "user_id": target_user.id,
            "role": target_user.role,
            "tenant_id": target_user.school_id,
            "school_id": target_user.school_id,
            "impersonated_by": caller["user_id"],
            "impersonated_by_email": caller["email"],
            "impersonation_session_id": session_id,
        },
        expires_delta=datetime.timedelta(minutes=IMPERSONATION_TOKEN_EXPIRE_MINUTES)
    )

    target_user_dict = {
        "id": target_user.id,
        "email": target_user.email,
        "name": target_user.full_name,
        "role": target_user.role,
        "schoolId": target_user.school_id,
        "mustChangePassword": target_user.must_change_password,
    }

    return {
        "access_token": impersonation_token,
        "token_type": "bearer",
        "user": target_user_dict,
        "impersonation_session_id": session_id,
    }

@app.post("/api/v1/auth/impersonate/{session_id}/end")
def end_impersonation(
    session_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "chairman", "teacher", "student", "parent", "accountant", "reception")),
    db: Session = Depends(get_db)
):
    audit = db.query(ImpersonationAudit).filter(ImpersonationAudit.id == session_id).first()
    if audit and not audit.ended_at:
        audit.ended_at = datetime.datetime.utcnow()
        db.commit()

    return {"message": "Impersonation session ended successfully."}

# AUDIT TRAIL LISTING ENDPOINTS
@app.get("/api/v1/audit/password-resets")
def get_password_reset_audits(
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "chairman")),
    db: Session = Depends(get_db)
):
    query = db.query(PasswordResetAudit)

    # Filter school_id for non-super_admins
    if caller.get("role") != "super_admin":
        query = query.filter(PasswordResetAudit.school_id == caller["school_id"])
    elif school_id:
        query = query.filter(PasswordResetAudit.school_id == school_id.strip().lower())

    audits = query.order_by(PasswordResetAudit.timestamp.desc()).all()

    results = []
    for a in audits:
        performed_by_text = "Self-service"
        if a.reset_type == "admin_forced" and a.performed_by_user_id:
            admin_user = db.query(User).filter(User.id == a.performed_by_user_id).first()
            performed_by_text = admin_user.email if admin_user else a.performed_by_user_id

        results.append({
            "id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "school_id": a.school_id,
            "target_email": a.target_email,
            "target_role": a.target_role,
            "reset_type": a.reset_type,
            "performed_by": performed_by_text,
            "performed_by_role": a.performed_by_role,
        })

    return results

@app.get("/api/v1/audit/impersonations")
def get_impersonation_audits(
    caller: dict = Depends(require_roles("super_admin")),
    db: Session = Depends(get_db)
):
    audits = db.query(ImpersonationAudit).order_by(ImpersonationAudit.started_at.desc()).all()
    return [
        {
            "id": a.id,
            "started_at": a.started_at.isoformat(),
            "ended_at": a.ended_at.isoformat() if a.ended_at else None,
            "super_admin_email": a.super_admin_email,
            "target_email": a.target_email,
            "target_school_id": a.target_school_id,
            "status": "Active" if not a.ended_at else "Completed",
        }
        for a in audits
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
