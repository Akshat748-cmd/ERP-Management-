import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine, Base
    from models import User, Tenant
    from security import get_password_hash
except ImportError:
    from backend.database import SessionLocal, engine, Base
    from backend.models import User, Tenant
    from backend.security import get_password_hash

def seed_database():
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Tenant
        tenant = db.query(Tenant).filter(Tenant.id == "amps-sr-sec-01").first()
        if not tenant:
            tenant = Tenant(
                id="amps-sr-sec-01",
                name="Ashish Memorial Public Sr. Sec. School",
                code="AMPS-MAIN",
                domain="amps-school.org",
                logo_url="/amps-logo.jpg",
                admin_email="admin@amps.edu",
                phone="+91 98290-00000",
                city="Hindaun City",
                active=True,
            )
            db.add(tenant)
            print("[Seed] Created AMPS Demo Tenant")

        # 2. Seed Default User Accounts
        default_users = [
            {
                "id": "usr_superadmin",
                "email": "superadmin@amps.edu",
                "full_name": "Super Admin",
                "role": "super_admin",
            },
            {
                "id": "usr_chairman",
                "email": "chairman@amps.edu",
                "full_name": "Chairman Board",
                "role": "chairman",
            },
            {
                "id": "usr_admin",
                "email": "admin@amps.edu",
                "full_name": "School Administrator",
                "role": "school_admin",
            },
            {
                "id": "usr_principal",
                "email": "principal@amps.edu",
                "full_name": "Principal Office",
                "role": "principal",
            },
            {
                "id": "usr_teacher",
                "email": "teacher@amps.edu",
                "full_name": "Faculty",
                "role": "teacher",
            },
            {
                "id": "usr_student",
                "email": "student@amps.edu",
                "full_name": "Rahul Kumar (Student)",
                "role": "student",
            },
            {
                "id": "usr_parent",
                "email": "parent@amps.edu",
                "full_name": "Suresh Kumar (Parent)",
                "role": "parent",
            },
            {
                "id": "usr_accountant",
                "email": "accountant@amps.edu",
                "full_name": "Accounts Manager",
                "role": "accountant",
            },
        ]

        try:
            from provisioning import get_default_role_password
        except ImportError:
            from backend.provisioning import get_default_role_password

        for udata in default_users:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            school_id = "platform" if udata["role"] == "super_admin" else "amps-sr-sec-01"
            pwd = get_default_role_password(udata["role"], school_id)
            pwd_hash = get_password_hash(pwd)
            if not existing:
                user = User(
                    id=udata["id"],
                    email=udata["email"],
                    full_name=udata["full_name"],
                    hashed_password=pwd_hash,
                    role=udata["role"],
                    school_id=school_id,
                    is_active=True,
                    must_change_password=False,
                )
                db.add(user)
                print(f"[Seed] Created User: {udata['email']} ({udata['role']}) -> Pwd: {pwd}")
            else:
                existing.school_id = school_id

        db.commit()
        print("[Seed] Local Development Demo Seeding Complete!")
    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if os.getenv("SEED_DEMO_DATA", "false").lower() == "true":
        seed_database()
    else:
        print("[Seed] Skipping demo seed script execution. Set SEED_DEMO_DATA=true to enable.")

