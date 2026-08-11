import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import ClassSchedule
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import ClassSchedule
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/schedules", tags=["Schedules"])

class ScheduleCreateRequest(BaseModel):
    className: str
    subject: str
    teacherName: str
    timeSlot: str
    roomNumber: str
    dayOfWeek: Optional[str] = "Monday"

class ScheduleResponse(BaseModel):
    id: str
    schoolId: str
    className: str
    subject: str
    teacherName: str
    timeSlot: str
    roomNumber: str
    dayOfWeek: str

def serialize_schedule(s: ClassSchedule) -> dict:
    return {
        "id": s.id,
        "schoolId": s.school_id,
        "className": s.class_name,
        "subject": s.subject,
        "teacherName": s.teacher_name,
        "timeSlot": s.time_slot,
        "roomNumber": s.room_number,
        "dayOfWeek": s.day_of_week,
    }

@router.get("", response_model=List[ScheduleResponse])
def list_schedules(
    class_name: Optional[str] = None,
    day: Optional[str] = None,
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    query = db.query(ClassSchedule).filter(ClassSchedule.school_id == target_school)

    if class_name:
        query = query.filter(ClassSchedule.class_name == class_name.strip())
    if day:
        query = query.filter(ClassSchedule.day_of_week == day.strip())

    results = query.all()
    return [serialize_schedule(s) for s in results]

@router.post("", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    payload: ScheduleCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    sch = ClassSchedule(
        id=f"sch_{uuid.uuid4().hex[:12]}",
        school_id=caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01",
        class_name=payload.className.strip(),
        subject=payload.subject.strip(),
        teacher_name=payload.teacherName.strip(),
        time_slot=payload.timeSlot.strip(),
        room_number=payload.roomNumber.strip(),
        day_of_week=payload.dayOfWeek.strip() if payload.dayOfWeek else "Monday",
    )

    db.add(sch)
    db.commit()
    db.refresh(sch)

    return serialize_schedule(sch)
