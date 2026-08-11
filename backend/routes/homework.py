import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import Homework, HomeworkSubmission, Student
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import Homework, HomeworkSubmission, Student
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/homework", tags=["Homework"])

class HomeworkCreateRequest(BaseModel):
    title: str
    subject: str
    className: str
    dueDate: str  # YYYY-MM-DD
    description: Optional[str] = None
    status: Optional[str] = "published"

class HomeworkUpdateRequest(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    className: Optional[str] = None
    dueDate: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class HomeworkSubmitRequest(BaseModel):
    submissionText: str

class HomeworkGradeRequest(BaseModel):
    grade: str
    feedback: Optional[str] = None

class HomeworkResponse(BaseModel):
    id: str
    schoolId: str
    title: str
    subject: str
    className: str
    description: Optional[str] = None
    createdByTeacherId: Optional[str] = None
    dueDate: str
    status: str
    createdAt: str
    submissionCount: int = 0
    isSubmitted: bool = False
    submittedAt: Optional[str] = None
    grade: Optional[str] = None
    feedback: Optional[str] = None

class HomeworkSubmissionResponse(BaseModel):
    id: str
    homeworkId: str
    studentId: str
    studentName: str
    rollNumber: str
    submissionText: Optional[str] = None
    submittedAt: str
    grade: Optional[str] = None
    feedback: Optional[str] = None

def serialize_homework(hw: Homework, db: Session, student_id: Optional[str] = None) -> dict:
    sub_count = db.query(HomeworkSubmission).filter(HomeworkSubmission.homework_id == hw.id).count()

    is_submitted = False
    submitted_at_str = None
    grade_val = None
    feedback_val = None

    if student_id:
        sub = db.query(HomeworkSubmission).filter(
            HomeworkSubmission.homework_id == hw.id,
            HomeworkSubmission.student_id == student_id,
        ).first()
        if sub:
            is_submitted = True
            submitted_at_str = sub.submitted_at.isoformat() if sub.submitted_at else None
            grade_val = sub.grade
            feedback_val = sub.feedback

    return {
        "id": hw.id,
        "schoolId": hw.school_id,
        "title": hw.title,
        "subject": hw.subject,
        "className": hw.class_name,
        "description": hw.description,
        "createdByTeacherId": hw.created_by_teacher_id,
        "dueDate": hw.due_date,
        "status": hw.status,
        "createdAt": hw.created_at.isoformat() if hw.created_at else "",
        "submissionCount": sub_count,
        "isSubmitted": is_submitted,
        "submittedAt": submitted_at_str,
        "grade": grade_val,
        "feedback": feedback_val,
    }

@router.get("", response_model=List[HomeworkResponse])
def list_homework(
    class_name: Optional[str] = None,
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    # Only retrieve non-deleted active homework (preserved for 2 months / 60 days in DB)
    query = db.query(Homework).filter(
        Homework.school_id == target_school,
        Homework.is_active == True
    )

    if class_name:
        query = query.filter(Homework.class_name == class_name.strip())

    student_id_for_caller = None

    # Students and Parents see ONLY published homework
    if caller.get("role") in ["student", "parent"]:
        query = query.filter(Homework.status == "published")
        if caller.get("role") == "student":
            student_id_for_caller = caller.get("user_id")
            st = db.query(Student).filter(Student.id == student_id_for_caller).first()
            if st:
                query = query.filter(Homework.class_name == st.class_name)

    homework_list = query.order_by(Homework.created_at.desc()).all()
    return [serialize_homework(hw, db, student_id=student_id_for_caller) for hw in homework_list]

@router.post("", response_model=HomeworkResponse, status_code=status.HTTP_201_CREATED)
def create_homework(
    payload: HomeworkCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    school_id = caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01"

    hw = Homework(
        id=f"hw_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        title=payload.title.strip(),
        subject=payload.subject.strip(),
        class_name=payload.className.strip(),
        description=payload.description.strip() if payload.description else None,
        created_by_teacher_id=caller["user_id"],
        due_date=payload.dueDate.strip(),
        status=payload.status.lower() if payload.status else "published",
        created_at=datetime.datetime.utcnow(),
    )

    db.add(hw)
    db.commit()
    db.refresh(hw)

    return serialize_homework(hw, db)

@router.put("/{homework_id}", response_model=HomeworkResponse)
def update_homework(
    homework_id: str,
    payload: HomeworkUpdateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    hw = db.query(Homework).filter(Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    if caller.get("role") != "super_admin" and hw.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    if payload.title is not None:
        hw.title = payload.title.strip()
    if payload.subject is not None:
        hw.subject = payload.subject.strip()
    if payload.className is not None:
        hw.class_name = payload.className.strip()
    if payload.dueDate is not None:
        hw.due_date = payload.dueDate.strip()
    if payload.description is not None:
        hw.description = payload.description.strip() if payload.description else None
    if payload.status is not None:
        hw.status = payload.status.lower()

    db.commit()
    db.refresh(hw)

    return serialize_homework(hw, db)

@router.post("/{homework_id}/submit", status_code=status.HTTP_201_CREATED)
def submit_homework(
    homework_id: str,
    payload: HomeworkSubmitRequest,
    caller: dict = Depends(require_roles("super_admin", "student")),
    db: Session = Depends(get_db)
):
    hw = db.query(Homework).filter(Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    # Enforce submission deadline (compare today's date YYYY-MM-DD against hw.due_date)
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    if hw.due_date and today_str > hw.due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Submission deadline ({hw.due_date}) has passed. Late submissions are closed for this assignment."
        )

    student_id = caller["user_id"]

    existing = db.query(HomeworkSubmission).filter(
        HomeworkSubmission.homework_id == homework_id,
        HomeworkSubmission.student_id == student_id,
    ).first()

    if existing:
        existing.submission_text = payload.submissionText.strip()
        existing.submitted_at = datetime.datetime.utcnow()
    else:
        sub = HomeworkSubmission(
            id=f"hws_{uuid.uuid4().hex[:12]}",
            homework_id=homework_id,
            student_id=student_id,
            submission_text=payload.submissionText.strip(),
            submitted_at=datetime.datetime.utcnow(),
        )
        db.add(sub)

    db.commit()
    return {"message": "Homework submitted successfully.", "homeworkId": homework_id}

@router.get("/{homework_id}/submissions", response_model=List[HomeworkSubmissionResponse])
def get_homework_submissions(
    homework_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    hw = db.query(Homework).filter(Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    subs = db.query(HomeworkSubmission, Student).join(
        Student, HomeworkSubmission.student_id == Student.id
    ).filter(HomeworkSubmission.homework_id == homework_id).order_by(HomeworkSubmission.submitted_at.desc()).all()

    output = []
    for sub, std in subs:
        output.append({
            "id": sub.id,
            "homeworkId": sub.homework_id,
            "studentId": sub.student_id,
            "studentName": std.full_name,
            "rollNumber": std.roll_number,
            "submissionText": sub.submission_text,
            "submittedAt": sub.submitted_at.isoformat() if sub.submitted_at else "",
            "grade": sub.grade,
            "feedback": sub.feedback,
        })
    return output

@router.post("/submissions/{submission_id}/grade")
def grade_homework_submission(
    submission_id: str,
    payload: HomeworkGradeRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    sub = db.query(HomeworkSubmission).filter(HomeworkSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Submission '{submission_id}' not found.")

    sub.grade = payload.grade.strip()
    if payload.feedback is not None:
        sub.feedback = payload.feedback.strip() if payload.feedback else None

    db.commit()
    return {"message": "Submission graded successfully.", "id": sub.id, "grade": sub.grade}

@router.post("/{homework_id}/publish", response_model=HomeworkResponse)
def publish_homework(
    homework_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    hw = db.query(Homework).filter(Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    if caller.get("role") != "super_admin" and hw.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    hw.status = "published"
    db.commit()
    db.refresh(hw)

    return serialize_homework(hw, db)

@router.delete("/{homework_id}")
def delete_homework(
    homework_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    hw = db.query(Homework).filter(Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    if caller.get("role") != "super_admin" and hw.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Homework '{homework_id}' not found.")

    # Soft-delete: Preserve deleted homework records for 2 months (60 days) retention requirement
    hw.is_active = False
    hw.deleted_at = datetime.datetime.utcnow()

    db.commit()
    return {"message": "Homework deleted and archived for 2 months retention.", "id": homework_id}
