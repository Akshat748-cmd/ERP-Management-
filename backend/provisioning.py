from typing import List, Dict, Optional
from sqlalchemy.orm import Session

try:
    from models import User
    from security import get_password_hash
except ImportError:
    from backend.models import User
    from backend.security import get_password_hash

# Define the 7 school-level roles to provision per tenant (excluding platform super_admin)
SCHOOL_ROLES = [
    {
        "role": "chairman",
        "email_prefix": "chairman",
        "default_name": "Board Chairman",
    },
    {
        "role": "school_admin",
        "email_prefix": "admin",
        "default_name": "School Administrator",
    },
    {
        "role": "principal",
        "email_prefix": "principal",
        "default_name": "School Principal",
    },
    {
        "role": "teacher",
        "email_prefix": "teacher",
        "default_name": "Faculty Teacher",
    },
    {
        "role": "student",
        "email_prefix": "student",
        "default_name": "Sample Student",
    },
    {
        "role": "parent",
        "email_prefix": "parent",
        "default_name": "Sample Parent",
    },
    {
        "role": "accountant",
        "email_prefix": "accountant",
        "default_name": "Accounts Manager",
    },
]

def get_clean_school_code(tenant_id: str) -> str:
    """
    Extracts clean alphanumeric school identifier e.g.
    'amps-sr-sec-01' -> 'amps'
    'dps-jaipur'     -> 'dpsjaipur'
    'st-xavier'      -> 'stxavier'
    """
    clean_all = "".join(c for c in tenant_id.lower() if c.isalnum())
    if clean_all.startswith("amps"):
        return "amps"
    return clean_all or "school"

def get_default_role_password(role_key: str, tenant_id: str) -> str:
    """
    Generates default password following formula: <role_name><school_identifier>
    For platform-level super_admin, default password is 'superadmin'.
    Examples:
    - super_admin          => superadmin
    - chairman + dps       => chairmandps
    - teacher + dps        => teacherdps
    """
    if role_key.lower() in ["super_admin", "superadmin"]:
        return "superadmin"
    school_code = get_clean_school_code(tenant_id)
    clean_role = role_key.lower().replace(" ", "").replace("_", "")
    return f"{clean_role}{school_code}"

def provision_school_users(
    db: Session,
    tenant_id: str,
    school_name: str,
    admin_name: str,
    admin_email: str,
    admin_password: Optional[str] = None
) -> List[Dict[str, str]]:
    """
    Provisions one User per role for a newly registered school tenant.
    Auto-generates default passwords following the formula: <role><school_identifier>
    (e.g., chairmandps, principaldps, teacherdps, studentdps).
    Stores hashed passwords in the DB with must_change_password=True.
    """
    domain = f"{tenant_id}.ampsportal.edu"
    credentials = []

    for item in SCHOOL_ROLES:
        role_key = item["role"]

        # Determine default role password (e.g. chairmandps, teacherdps, principaldps)
        default_pwd = get_default_role_password(role_key, tenant_id)

        if role_key == "school_admin":
            email = admin_email.strip().lower()
            name = admin_name if admin_name else item["default_name"]
            password = admin_password if admin_password else default_pwd
        else:
            email = f"{item['email_prefix']}@{domain}"
            name = f"{item['default_name']} ({school_name})"
            password = default_pwd

        user_id = f"usr_{tenant_id}_{role_key}"

        existing_user = db.query(User).filter(User.email == email).first()
        if not existing_user:
            hashed_pwd = get_password_hash(password)
            user = User(
                id=user_id,
                email=email,
                full_name=name,
                hashed_password=hashed_pwd,
                role=role_key,
                school_id=tenant_id,
                is_active=True,
                must_change_password=False,
            )
            db.add(user)

        credentials.append({
            "role": role_key,
            "email": email,
            "password": password,
        })

    db.commit()
    return credentials
