import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import AttendanceRecord, Student
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import AttendanceRecord, Student
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance"])

class AttendanceItem(BaseModel):
    studentId: str
    status: str  # 'present' | 'absent' | 'late'

class BulkAttendanceRequest(BaseModel):
    className: str
    date: str  # YYYY-MM-DD
    records: List[AttendanceItem]

class AttendanceResponse(BaseModel):
    id: str
    schoolId: str
    studentId: str
    studentName: str
    rollNumber: str
    className: str
    date: str
    status: str
    markedByUserId: Optional[str] = None
    markedAt: str

@router.get("", response_model=List[AttendanceResponse])
def list_attendance(
    class_name: Optional[str] = None,
    date: Optional[str] = None,
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    query = db.query(AttendanceRecord, Student).join(
        Student, AttendanceRecord.student_id == Student.id
    ).filter(AttendanceRecord.school_id == target_school)

    if class_name:
        query = query.filter(AttendanceRecord.class_name == class_name.strip())

    if date:
        query = query.filter(AttendanceRecord.date == date.strip())

    # Role-scoped filtering for students & parents
    if caller.get("role") == "student":
        query = query.filter(AttendanceRecord.student_id == caller["user_id"])
    elif caller.get("role") == "parent":
        query = query.filter(Student.parent_user_id == caller["user_id"])

    results = query.order_by(AttendanceRecord.class_name, Student.full_name).all()

    output = []
    for att, std in results:
        output.append({
            "id": att.id,
            "schoolId": att.school_id,
            "studentId": att.student_id,
            "studentName": std.full_name,
            "rollNumber": std.roll_number,
            "className": att.class_name,
            "date": att.date,
            "status": att.status,
            "markedByUserId": att.marked_by_user_id,
            "markedAt": att.marked_at.isoformat() if att.marked_at else "",
        })

    return output

@router.post("/mark", status_code=status.HTTP_200_OK)
def bulk_mark_attendance(
    payload: BulkAttendanceRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    school_id = caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01"
    clean_date = payload.date.strip()
    clean_class = payload.className.strip()

    marked_count = 0
    for item in payload.records:
        clean_status = item.status.lower()
        if clean_status not in ["present", "absent", "late"]:
            continue

        existing = db.query(AttendanceRecord).filter(
            AttendanceRecord.school_id == school_id,
            AttendanceRecord.student_id == item.studentId,
            AttendanceRecord.date == clean_date,
        ).first()

        if existing:
            existing.status = clean_status
            existing.marked_by_user_id = caller["user_id"]
            existing.marked_at = datetime.datetime.utcnow()
        else:
            rec = AttendanceRecord(
                id=f"att_{uuid.uuid4().hex[:12]}",
                school_id=school_id,
                student_id=item.studentId,
                class_name=clean_class,
                date=clean_date,
                status=clean_status,
                marked_by_user_id=caller["user_id"],
                marked_at=datetime.datetime.utcnow(),
            )
            db.add(rec)
        marked_count += 1

    db.commit()
    return {"message": f"Successfully recorded attendance for {marked_count} students.", "date": clean_date, "className": clean_class}

@router.put("/{attendance_id}")
def update_attendance_record(
    attendance_id: str,
    payload: AttendanceItem,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    rec = db.query(AttendanceRecord).filter(AttendanceRecord.id == attendance_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Attendance record '{attendance_id}' not found.")

    if caller.get("role") != "super_admin" and rec.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Attendance record '{attendance_id}' not found.")

    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    # Same-day correction restriction unless caller has approve_attendance roles (principal/super_admin/school_admin)
    if rec.date != today_str and caller.get("role") not in ["super_admin", "school_admin", "principal"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Past attendance records can only be modified with Principal approval."
        )

    rec.status = payload.status.lower()
    rec.marked_by_user_id = caller["user_id"]
    rec.marked_at = datetime.datetime.utcnow()

    db.commit()
    return {"message": "Attendance record updated successfully.", "id": rec.id, "status": rec.status}
