import uuid
import json
import datetime
from typing import Optional, List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import Teacher, TeacherAttendance
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import Teacher, TeacherAttendance
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/teachers", tags=["Teachers"])

class TeacherCreateRequest(BaseModel):
    fullName: str
    employeeCode: str
    subjects: Optional[Union[List[str], str]] = None
    classesAssigned: Optional[Union[List[str], str]] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class TeacherUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    employeeCode: Optional[str] = None
    subjects: Optional[Union[List[str], str]] = None
    classesAssigned: Optional[Union[List[str], str]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    isActive: Optional[bool] = None

class TeacherResponse(BaseModel):
    id: str
    schoolId: str
    fullName: str
    employeeCode: str
    subjects: List[str]
    classesAssigned: List[str]
    phone: Optional[str] = None
    email: Optional[str] = None
    isActive: bool
    createdAt: str

def parse_list_field(val: Optional[str]) -> List[str]:
    if not val:
        return []
    try:
        parsed = json.loads(val)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        pass
    return [x.strip() for x in val.split(",") if x.strip()]

def serialize_list_field(val: Optional[Union[List[str], str]]) -> Optional[str]:
    if val is None:
        return None
    if isinstance(val, list):
        return json.dumps(val)
    return val.strip()

def serialize_teacher(t: Teacher) -> dict:
    return {
        "id": t.id,
        "schoolId": t.school_id,
        "fullName": t.full_name,
        "employeeCode": t.employee_code,
        "subjects": parse_list_field(t.subjects),
        "classesAssigned": parse_list_field(t.classes_assigned),
        "phone": t.phone,
        "email": t.email,
        "isActive": t.is_active,
        "createdAt": t.created_at.isoformat() if t.created_at else "",
    }

@router.get("", response_model=List[TeacherResponse])
def list_teachers(
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "accountant")),
    db: Session = Depends(get_db)
):
    query = db.query(Teacher).filter(Teacher.is_active == True)

    if caller.get("role") != "super_admin":
        query = query.filter(Teacher.school_id == caller["school_id"])
    elif school_id:
        query = query.filter(Teacher.school_id == school_id.strip().lower())

    teachers = query.order_by(Teacher.full_name).all()
    return [serialize_teacher(t) for t in teachers]

@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher_by_id(
    teacher_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman")),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    if caller.get("role") != "super_admin" and teacher.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    return serialize_teacher(teacher)

@router.post("", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(
    payload: TeacherCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    school_id = caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01"
    clean_code = payload.employeeCode.strip()

    existing = db.query(Teacher).filter(
        Teacher.school_id == school_id,
        Teacher.employee_code == clean_code,
        Teacher.is_active == True,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee code '{clean_code}' already exists for this school."
        )

    teacher = Teacher(
        id=f"tch_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        full_name=payload.fullName.strip(),
        employee_code=clean_code,
        subjects=serialize_list_field(payload.subjects),
        classes_assigned=serialize_list_field(payload.classesAssigned),
        phone=payload.phone.strip() if payload.phone else None,
        email=payload.email.strip() if payload.email else None,
        is_active=True,
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return serialize_teacher(teacher)

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: str,
    payload: TeacherUpdateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    if caller.get("role") != "super_admin" and teacher.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    if payload.employeeCode is not None:
        clean_code = payload.employeeCode.strip()
        if clean_code != teacher.employee_code:
            conflict = db.query(Teacher).filter(
                Teacher.school_id == teacher.school_id,
                Teacher.employee_code == clean_code,
                Teacher.id != teacher.id,
                Teacher.is_active == True,
            ).first()

            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Employee code '{clean_code}' already exists."
                )
            teacher.employee_code = clean_code

    if payload.fullName is not None:
        teacher.full_name = payload.fullName.strip()
    if payload.subjects is not None:
        teacher.subjects = serialize_list_field(payload.subjects)
    if payload.classesAssigned is not None:
        teacher.classes_assigned = serialize_list_field(payload.classesAssigned)
    if payload.phone is not None:
        teacher.phone = payload.phone.strip() if payload.phone else None
    if payload.email is not None:
        teacher.email = payload.email.strip() if payload.email else None
    if payload.isActive is not None:
        teacher.is_active = payload.isActive

    db.commit()
    db.refresh(teacher)
    return serialize_teacher(teacher)

@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin")),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    if caller.get("role") != "super_admin" and teacher.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Teacher '{teacher_id}' not found.")

    teacher.is_active = False
    db.commit()

    return {"message": f"Teacher '{teacher.full_name}' deactivated successfully.", "id": teacher.id}


# ─── Teacher Self Check-In (Daily Attendance) ───────────────────────────────

class CheckInRequest(BaseModel):
    status: str  # 'present' | 'late'
    note: Optional[str] = None

class CheckInResponse(BaseModel):
    id: str
    teacherUserId: str
    teacherName: str
    date: str
    status: str
    checkInTime: str
    note: Optional[str] = None
    alreadyCheckedIn: bool = False

@router.post("/checkin", response_model=CheckInResponse, status_code=status.HTTP_200_OK)
def teacher_checkin(
    payload: CheckInRequest,
    caller: dict = Depends(require_roles("teacher", "school_admin", "principal", "chairman")),
    db: Session = Depends(get_db)
):
    """Teacher marks their own attendance for today."""
    if payload.status not in ('present', 'late'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'present' or 'late'.")

    today = datetime.date.today().isoformat()
    school_id = caller["school_id"]
    user_id = caller["user_id"]

    # Check if already checked in today
    existing = db.query(TeacherAttendance).filter(
        TeacherAttendance.school_id == school_id,
        TeacherAttendance.teacher_user_id == user_id,
        TeacherAttendance.date == today
    ).first()

    if existing:
        return {
            "id": existing.id,
            "teacherUserId": existing.teacher_user_id,
            "teacherName": existing.teacher_name,
            "date": existing.date,
            "status": existing.status,
            "checkInTime": existing.check_in_time.isoformat(),
            "note": existing.note,
            "alreadyCheckedIn": True,
        }

    rec = TeacherAttendance(
        id=f"tatt_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        teacher_user_id=user_id,
        teacher_name=caller.get("name", "Faculty"),
        date=today,
        status=payload.status,
        note=payload.note,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": rec.id,
        "teacherUserId": rec.teacher_user_id,
        "teacherName": rec.teacher_name,
        "date": rec.date,
        "status": rec.status,
        "checkInTime": rec.check_in_time.isoformat(),
        "note": rec.note,
        "alreadyCheckedIn": False,
    }

@router.get("/checkin/today", response_model=Optional[CheckInResponse])
def get_today_checkin(
    caller: dict = Depends(require_roles("teacher", "school_admin", "principal", "chairman", "super_admin")),
    db: Session = Depends(get_db)
):
    """Check if the teacher has already checked in today."""
    today = datetime.date.today().isoformat()
    existing = db.query(TeacherAttendance).filter(
        TeacherAttendance.school_id == caller["school_id"],
        TeacherAttendance.teacher_user_id == caller["user_id"],
        TeacherAttendance.date == today
    ).first()

    if not existing:
        return None

    return {
        "id": existing.id,
        "teacherUserId": existing.teacher_user_id,
        "teacherName": existing.teacher_name,
        "date": existing.date,
        "status": existing.status,
        "checkInTime": existing.check_in_time.isoformat(),
        "note": existing.note,
        "alreadyCheckedIn": True,
    }

@router.get("/checkin/roster", response_model=List[CheckInResponse])
def get_checkin_roster(
    date: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "chairman")),
    db: Session = Depends(get_db)
):
    """Admin view: all teacher check-ins for a given date (default today)."""
    target_date = date or datetime.date.today().isoformat()
    school_id = caller["school_id"] if caller.get("role") != "super_admin" else caller.get("school_id", "")

    records = db.query(TeacherAttendance).filter(
        TeacherAttendance.school_id == school_id,
        TeacherAttendance.date == target_date
    ).order_by(TeacherAttendance.check_in_time).all()

    return [{
        "id": r.id,
        "teacherUserId": r.teacher_user_id,
        "teacherName": r.teacher_name,
        "date": r.date,
        "status": r.status,
        "checkInTime": r.check_in_time.isoformat(),
        "note": r.note,
        "alreadyCheckedIn": True,
    } for r in records]
