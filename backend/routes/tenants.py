from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List

try:
    from database import get_db
    from models import Tenant, User
    from security import get_password_hash
    from provisioning import provision_school_users
except ImportError:
    from backend.database import get_db
    from backend.models import Tenant, User
    from backend.security import get_password_hash
    from backend.provisioning import provision_school_users

router = APIRouter(prefix="/api/v1/tenants", tags=["Tenants"])

class TenantRegisterRequest(BaseModel):
    schoolName: str
    slug: str
    adminName: str
    adminEmail: str
    password: str
    phone: Optional[str] = None
    city: Optional[str] = None
    logoUrl: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    name: str
    code: str
    domain: str
    logoUrl: Optional[str] = None
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    address: Optional[str] = None
    active: bool

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_tenant(payload: TenantRegisterRequest, db: Session = Depends(get_db)):
    slug = payload.slug.strip().lower()
    if not slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School slug/subdomain is required."
        )

    # 1. Reject if slug/id already exists
    existing_tenant = db.query(Tenant).filter(Tenant.id == slug).first()
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"School subdomain/slug '{slug}' is already registered."
        )

    # 2. Check if admin email already exists
    existing_user = db.query(User).filter(User.email == payload.adminEmail).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User account with email '{payload.adminEmail}' already exists."
        )

    # 3. Create Tenant
    tenant = Tenant(
        id=slug,
        name=payload.schoolName,
        code=slug.upper(),
        domain=f"{slug}.ampsportal.edu",
        logo_url=payload.logoUrl if payload.logoUrl else None,
        admin_email=payload.adminEmail,
        phone=payload.phone,
        city=payload.city,
        active=True,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    # 4. Provision users for all 7 school roles (chairman, school_admin, principal, teacher, student, parent, accountant)
    # CRITICAL: Plaintext passwords are ONLY returned once in this initial response and never stored in plaintext anywhere.
    credentials = provision_school_users(
        db=db,
        tenant_id=tenant.id,
        school_name=tenant.name,
        admin_name=payload.adminName,
        admin_email=payload.adminEmail,
        admin_password=payload.password,
    )

    return {
        "tenantId": tenant.id,
        "portalUrl": f"/login?school={tenant.id}",
        "schoolName": tenant.name,
        "adminEmail": payload.adminEmail,
        "credentials": credentials,
    }

@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant_by_id(tenant_id: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id.strip().lower()).first()
    if not tenant or not tenant.active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School tenant '{tenant_id}' not found or is inactive."
        )

    return TenantResponse(
        id=tenant.id,
        name=tenant.name,
        code=tenant.code,
        domain=tenant.domain,
        logoUrl=tenant.logo_url,
        contactEmail=tenant.admin_email,
        contactPhone=tenant.phone,
        address=f"{tenant.city}, India" if tenant.city else "Main Campus",
        active=tenant.active,
    )

class TenantPickerResponse(BaseModel):
    id: str
    name: str
    code: str
    logoUrl: Optional[str] = None

@router.get("", response_model=List[TenantPickerResponse])
def list_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).filter(Tenant.active == True).all()
    return [
        TenantPickerResponse(
            id=t.id,
            name=t.name,
            code=t.code,
            logoUrl=t.logo_url,
        )
        for t in tenants
    ]
