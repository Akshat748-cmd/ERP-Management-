import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal, engine, Base
    from models import User, Tenant
    from security import get_password_hash
    from provisioning import get_default_role_password
except ImportError:
    from backend.database import SessionLocal, engine, Base
    from backend.models import User, Tenant
    from backend.security import get_password_hash
    from backend.provisioning import get_default_role_password

def reset_all_user_default_passwords():
    """
    Standalone script to reset/update all existing users in the database
    to follow the default password formula: <role><school_identifier>
    Example:
      - super_admin @ amps -> super_adminamps
      - chairman @ dps     -> chairmandps
      - teacher @ dps      -> teacherdps
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n=======================================================")
        print(f"RESETTING DEFAULT PASSWORDS FOR {len(users)} SYSTEM USERS")
        print(f"=======================================================\n")
        print(f"{'ROLE':<15} | {'EMAIL':<35} | {'NEW DEFAULT PASSWORD'}")
        print("-" * 75)

        for user in users:
            new_pwd = get_default_role_password(user.role, user.school_id)
            user.hashed_password = get_password_hash(new_pwd)
            user.must_change_password = True
            print(f"{user.role:<15} | {user.email:<35} | {new_pwd}")

        db.commit()
        print("-" * 75)
        print("ALL USER PASSWORDS UPDATED SUCCESSFULLY!\n")
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_all_user_default_passwords()
