import uuid
import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import Result, Student, Teacher, Tenant, User
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import Result, Student, Teacher, Tenant, User
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/results", tags=["Results"])

class SubjectScore(BaseModel):
    subjectName: str
    maxMarks: int = 100
    obtainedMarks: int

class ResultCreateRequest(BaseModel):
    studentId: str
    examName: str
    className: str
    subjects: List[SubjectScore]
    status: Optional[str] = "draft"

class ResultUpdateRequest(BaseModel):
    examName: Optional[str] = None
    className: Optional[str] = None
    subjects: Optional[List[SubjectScore]] = None
    status: Optional[str] = None

class ResultResponse(BaseModel):
    id: str
    schoolId: str
    studentId: str
    studentName: str
    rollNumber: str
    examName: str
    className: str
    subjects: List[SubjectScore]
    aggregateScore: int
    totalMaxMarks: int
    percentage: float
    grade: str
    status: str
    enteredByTeacherId: Optional[str] = None
    publishedByPrincipalId: Optional[str] = None
    publishedAt: Optional[str] = None
    createdAt: str

def compute_grade(percentage: float) -> str:
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B+"
    elif percentage >= 60:
        return "B"
    elif percentage >= 50:
        return "C"
    return "F"

def serialize_result(res: Result, std: Student) -> dict:
    sub_list = []
    if res.subject_scores:
        try:
            sub_list = json.loads(res.subject_scores)
        except Exception:
            pass

    return {
        "id": res.id,
        "schoolId": res.school_id,
        "studentId": res.student_id,
        "studentName": std.full_name if std else "Unknown",
        "rollNumber": std.roll_number if std else "—",
        "examName": res.exam_name,
        "className": res.class_name,
        "subjects": sub_list,
        "aggregateScore": res.aggregate_score,
        "totalMaxMarks": res.total_max_marks,
        "percentage": float(res.percentage),
        "grade": res.grade or "F",
        "status": res.status,
        "enteredByTeacherId": res.entered_by_teacher_id,
        "publishedByPrincipalId": res.published_by_principal_id,
        "publishedAt": res.published_at.isoformat() if res.published_at else None,
        "createdAt": res.created_at.isoformat() if res.created_at else "",
    }

@router.get("", response_model=List[ResultResponse])
def list_results(
    class_name: Optional[str] = None,
    exam_name: Optional[str] = None,
    grade: Optional[str] = None,
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    query = db.query(Result, Student).join(
        Student, Result.student_id == Student.id
    ).filter(Result.school_id == target_school)

    if class_name:
        query = query.filter(Result.class_name == class_name.strip())

    if exam_name:
        query = query.filter(Result.exam_name == exam_name.strip())

    if grade:
        query = query.filter(Result.grade == grade.strip())

    # Role-scoped filtering for students & parents (ONLY published results)
    if caller.get("role") == "student":
        query = query.filter(Result.status == "published", Result.student_id == caller["user_id"])
    elif caller.get("role") == "parent":
        query = query.filter(Result.status == "published", Student.parent_user_id == caller["user_id"])

    results = query.order_by(Result.class_name, Student.full_name, Result.exam_name).all()
    return [serialize_result(res, std) for res, std in results]

@router.post("", response_model=ResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(
    payload: ResultCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == payload.studentId).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{payload.studentId}' not found.")

    school_id = caller["school_id"] if caller.get("role") != "super_admin" else student.school_id

    subj_dicts = [s.dict() for s in payload.subjects]
    total_obtained = sum(s.obtainedMarks for s in payload.subjects)
    total_max = sum(s.maxMarks for s in payload.subjects) or 100
    pct = round((total_obtained / total_max) * 100, 1)
    grd = compute_grade(pct)

    res = Result(
        id=f"res_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        student_id=payload.studentId,
        exam_name=payload.examName.strip(),
        class_name=payload.className.strip(),
        subject_scores=json.dumps(subj_dicts),
        aggregate_score=total_obtained,
        total_max_marks=total_max,
        percentage=int(pct),
        grade=grd,
        status=payload.status.lower() if payload.status else "draft",
        entered_by_teacher_id=caller["user_id"],
        created_at=datetime.datetime.utcnow(),
    )

    db.add(res)
    db.commit()
    db.refresh(res)

    return serialize_result(res, student)

@router.put("/{result_id}", response_model=ResultResponse)
def update_result(
    result_id: str,
    payload: ResultUpdateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    res = db.query(Result).filter(Result.id == result_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    if caller.get("role") != "super_admin" and res.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    student = db.query(Student).filter(Student.id == res.student_id).first()

    if payload.examName is not None:
        res.exam_name = payload.examName.strip()
    if payload.className is not None:
        res.class_name = payload.className.strip()
    if payload.status is not None:
        res.status = payload.status.lower()

    if payload.subjects is not None:
        subj_dicts = [s.dict() for s in payload.subjects]
        total_obtained = sum(s.obtainedMarks for s in payload.subjects)
        total_max = sum(s.maxMarks for s in payload.subjects) or 100
        pct = round((total_obtained / total_max) * 100, 1)

        res.subject_scores = json.dumps(subj_dicts)
        res.aggregate_score = total_obtained
        res.total_max_marks = total_max
        res.percentage = int(pct)
        res.grade = compute_grade(pct)

    db.commit()
    db.refresh(res)

    return serialize_result(res, student)

@router.post("/{result_id}/publish")
def publish_result(
    result_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    res = db.query(Result).filter(Result.id == result_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    if caller.get("role") != "super_admin" and res.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    res.status = "published"
    res.published_by_principal_id = caller["user_id"]
    res.published_at = datetime.datetime.utcnow()

    db.commit()
    return {"message": "Exam result published successfully.", "id": res.id, "status": "published"}

@router.post("/{result_id}/unpublish")
def unpublish_result(
    result_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    res = db.query(Result).filter(Result.id == result_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    if caller.get("role") != "super_admin" and res.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    res.status = "draft"
    db.commit()
    return {"message": "Result reverted to draft.", "id": res.id, "status": "draft"}

@router.delete("/{result_id}")
def delete_result(
    result_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    res = db.query(Result).filter(Result.id == result_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    if caller.get("role") != "super_admin" and res.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    db.delete(res)
    db.commit()
    return {"message": "Result record deleted successfully.", "id": result_id}

@router.get("/{result_id}/signatures")
def get_result_signatures(
    result_id: str,
    db: Session = Depends(get_db)
):
    res = db.query(Result).filter(Result.id == result_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Result record '{result_id}' not found.")

    tenant = db.query(Tenant).filter(Tenant.id == res.school_id).first()
    school_name = tenant.name if tenant and tenant.name else "School Evaluation Board"
    seal_url = tenant.seal_url if tenant else None
    logo_url = tenant.logo_url if tenant else None

    # 1. Class Teacher matching class_name and school_id
    class_teacher = db.query(Teacher).filter(
        Teacher.school_id == res.school_id,
        Teacher.classes_assigned.like(f"%{res.class_name}%")
    ).first()

    if not class_teacher:
        class_teacher = db.query(Teacher).filter(Teacher.school_id == res.school_id).first()

    class_teacher_name = class_teacher.full_name if class_teacher else None

    # 2. Exam Controller (from Tenant or Teacher/Admin)
    exam_controller_name = tenant.exam_controller_name if tenant and tenant.exam_controller_name else None
    if not exam_controller_name:
        controller = db.query(Teacher).filter(
            Teacher.school_id == res.school_id,
            Teacher.subjects.like("%Exam%")
        ).first()
        if controller:
            exam_controller_name = controller.full_name

    if not exam_controller_name:
        admin_user = db.query(User).filter(
            User.school_id == res.school_id,
            User.role == "school_admin"
        ).first()
        if admin_user:
            exam_controller_name = admin_user.full_name

    # 3. Principal Name (from Principal User or Tenant setting)
    principal_user = db.query(User).filter(
        User.school_id == res.school_id,
        User.role == "principal"
    ).first()

    principal_name = principal_user.full_name if principal_user else (
        tenant.principal_name if tenant and tenant.principal_name else None
    )

    return {
        "schoolId": res.school_id,
        "schoolName": school_name,
        "sealUrl": seal_url,
        "logoUrl": logo_url,
        "classTeacherName": class_teacher_name,
        "examControllerName": exam_controller_name,
        "principalName": principal_name,
    }

