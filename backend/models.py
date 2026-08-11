import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer

try:
    from database import Base
except ImportError:
    from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # e.g., 'school_admin', 'principal', 'teacher', 'student', 'parent', 'accountant'
    school_id = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=True, nullable=False)
    password_changed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    admin_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class PasswordResetAudit(Base):
    __tablename__ = "password_reset_audit"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    target_user_id = Column(String, nullable=False, index=True)
    target_email = Column(String, nullable=False)
    target_role = Column(String, nullable=False)
    reset_type = Column(String, nullable=False)  # 'self_service' | 'admin_forced'
    performed_by_user_id = Column(String, nullable=True)  # null if self-service
    performed_by_role = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class ImpersonationAudit(Base):
    __tablename__ = "impersonation_audit"

    id = Column(String, primary_key=True, index=True)
    super_admin_user_id = Column(String, nullable=False, index=True)
    super_admin_email = Column(String, nullable=False)
    target_user_id = Column(String, nullable=False, index=True)
    target_email = Column(String, nullable=False)
    target_school_id = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
