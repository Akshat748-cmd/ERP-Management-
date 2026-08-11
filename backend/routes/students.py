import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import Student
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import Student
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/students", tags=["Students"])

class StudentCreateRequest(BaseModel):
    fullName: str
    rollNumber: str
    className: str
    section: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    parentUserId: Optional[str] = None

class StudentUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    rollNumber: Optional[str] = None
    className: Optional[str] = None
    section: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    parentUserId: Optional[str] = None
    isActive: Optional[bool] = None

class StudentResponse(BaseModel):
    id: str
    schoolId: str
    fullName: str
    rollNumber: str
    className: str
    section: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    parentUserId: Optional[str] = None
    admissionDate: str
    isActive: bool
    createdAt: str

def serialize_student(s: Student) -> dict:
    return {
        "id": s.id,
        "schoolId": s.school_id,
        "fullName": s.full_name,
        "rollNumber": s.roll_number,
        "className": s.class_name,
        "section": s.section,
        "dateOfBirth": s.date_of_birth.strftime("%Y-%m-%d") if s.date_of_birth else None,
        "gender": s.gender,
        "parentUserId": s.parent_user_id,
        "admissionDate": s.admission_date.strftime("%Y-%m-%d") if s.admission_date else "",
        "isActive": s.is_active,
        "createdAt": s.created_at.isoformat() if s.created_at else "",
    }

@router.get("", response_model=List[StudentResponse])
def list_students(
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "accountant")),
    db: Session = Depends(get_db)
):
    query = db.query(Student).filter(Student.is_active == True)

    if caller.get("role") != "super_admin":
        query = query.filter(Student.school_id == caller["school_id"])
    elif school_id:
        query = query.filter(Student.school_id == school_id.strip().lower())

    students = query.order_by(Student.class_name, Student.full_name).all()
    return [serialize_student(s) for s in students]

@router.get("/{student_id}", response_model=StudentResponse)
def get_student_by_id(
    student_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "student", "parent", "accountant", "reception")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    # Enforce tenant isolation (return 404 to avoid leaking existence across tenants)
    if caller.get("role") != "super_admin" and student.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    # Specific self/child access control for student and parent roles
    if caller.get("role") == "student" and caller.get("user_id") != student.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students can only view their own academic record.")

    if caller.get("role") == "parent" and caller.get("user_id") != student.parent_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parents can only view their linked child data.")

    return serialize_student(student)

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    school_id = caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01"
    
    clean_roll = payload.rollNumber.strip()
    clean_class = payload.className.strip()

    # Check unique constraint on (school_id, roll_number, class_name)
    existing = db.query(Student).filter(
        Student.school_id == school_id,
        Student.roll_number == clean_roll,
        Student.class_name == clean_class,
        Student.is_active == True,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Roll number '{clean_roll}' already exists in class '{clean_class}' for this school."
        )

    dob = None
    if payload.dateOfBirth:
        try:
            dob = datetime.datetime.strptime(payload.dateOfBirth.strip(), "%Y-%m-%d")
        except ValueError:
            pass

    student = Student(
        id=f"std_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        full_name=payload.fullName.strip(),
        roll_number=clean_roll,
        class_name=clean_class,
        section=payload.section.strip() if payload.section else None,
        date_of_birth=dob,
        gender=payload.gender.strip() if payload.gender else None,
        parent_user_id=payload.parentUserId.strip() if payload.parentUserId else None,
        admission_date=datetime.datetime.utcnow(),
        is_active=True,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return serialize_student(student)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    payload: StudentUpdateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    if caller.get("role") != "super_admin" and student.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    target_roll = payload.rollNumber.strip() if payload.rollNumber else student.roll_number
    target_class = payload.className.strip() if payload.className else student.class_name

    if payload.rollNumber or payload.className:
        conflict = db.query(Student).filter(
            Student.school_id == student.school_id,
            Student.roll_number == target_roll,
            Student.class_name == target_class,
            Student.id != student.id,
            Student.is_active == True,
        ).first()

        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roll number '{target_roll}' already exists in class '{target_class}'."
            )

    if payload.fullName is not None:
        student.full_name = payload.fullName.strip()
    if payload.rollNumber is not None:
        student.roll_number = target_roll
    if payload.className is not None:
        student.class_name = target_class
    if payload.section is not None:
        student.section = payload.section.strip() if payload.section else None
    if payload.gender is not None:
        student.gender = payload.gender.strip() if payload.gender else None
    if payload.parentUserId is not None:
        student.parent_user_id = payload.parentUserId.strip() if payload.parentUserId else None
    if payload.isActive is not None:
        student.is_active = payload.isActive
    if payload.dateOfBirth is not None:
        try:
            student.date_of_birth = datetime.datetime.strptime(payload.dateOfBirth.strip(), "%Y-%m-%d")
        except ValueError:
            pass

    db.commit()
    db.refresh(student)
    return serialize_student(student)

@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    if caller.get("role") != "super_admin" and student.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{student_id}' not found.")

    # Soft delete (set is_active=False)
    student.is_active = False
    db.commit()

    return {"message": f"Student '{student.full_name}' has been deactivated.", "id": student.id}
