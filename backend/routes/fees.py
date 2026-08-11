import uuid
import datetime
from typing import Optional, List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import FeeRecord, Student
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import FeeRecord, Student
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/fees", tags=["Fees"])

class FeeCreateRequest(BaseModel):
    studentId: str
    feeTerm: str
    title: str
    amountDue: int
    dueDate: str  # YYYY-MM-DD

class FeeCollectRequest(BaseModel):
    amountPaid: int

class FeeRecordResponse(BaseModel):
    id: str
    schoolId: str
    studentId: str
    studentName: str
    rollNumber: str
    className: str
    feeTerm: str
    title: str
    amountDue: int
    amountPaid: int
    paymentStatus: str
    dueDate: str
    lastPaymentDate: Optional[str] = None
    createdAt: str

def serialize_fee_record(fee: FeeRecord, std: Student) -> dict:
    return {
        "id": fee.id,
        "schoolId": fee.school_id,
        "studentId": fee.student_id,
        "studentName": std.full_name if std else "Unknown",
        "rollNumber": std.roll_number if std else "—",
        "className": std.class_name if std else "—",
        "feeTerm": fee.fee_term,
        "title": fee.title,
        "amountDue": fee.amount_due,
        "amountPaid": fee.amount_paid,
        "paymentStatus": fee.payment_status,
        "dueDate": fee.due_date,
        "lastPaymentDate": fee.last_payment_date.isoformat() if fee.last_payment_date else None,
        "createdAt": fee.created_at.isoformat() if fee.created_at else "",
    }

@router.get("")
def list_fees(
    fee_term: Optional[str] = None,
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "accountant", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    query = db.query(FeeRecord, Student).join(
        Student, FeeRecord.student_id == Student.id
    ).filter(FeeRecord.school_id == target_school)

    if fee_term:
        query = query.filter(FeeRecord.fee_term == fee_term.strip())

    # Role-scoped filtering for students & parents
    if caller.get("role") == "student":
        query = query.filter(FeeRecord.student_id == caller["user_id"])
    elif caller.get("role") == "parent":
        query = query.filter(Student.parent_user_id == caller["user_id"])

    # If principal or chairman (view_fees_summary only), return aggregated metrics summary
    if caller.get("role") in ["principal", "chairman"]:
        fee_rows = query.all()
        total_target = sum(f[0].amount_due for f in fee_rows)
        total_collected = sum(f[0].amount_paid for f in fee_rows)
        return {
            "summaryOnly": True,
            "totalTarget": total_target,
            "totalCollected": total_collected,
            "outstandingBalance": max(0, total_target - total_collected),
            "recordCount": len(fee_rows),
        }

    results = query.order_by(FeeRecord.created_at.desc()).all()
    return [serialize_fee_record(fee, std) for fee, std in results]

@router.post("", response_model=FeeRecordResponse, status_code=status.HTTP_201_CREATED)
def create_fee_record(
    payload: FeeCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "accountant")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == payload.studentId).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student '{payload.studentId}' not found.")

    school_id = caller["school_id"] if caller.get("role") != "super_admin" else student.school_id

    fee = FeeRecord(
        id=f"fee_{uuid.uuid4().hex[:12]}",
        school_id=school_id,
        student_id=payload.studentId,
        fee_term=payload.feeTerm.strip(),
        title=payload.title.strip(),
        amount_due=payload.amountDue,
        amount_paid=0,
        payment_status="pending",
        due_date=payload.dueDate.strip(),
        created_at=datetime.datetime.utcnow(),
    )

    db.add(fee)
    db.commit()
    db.refresh(fee)

    return serialize_fee_record(fee, student)

@router.post("/{fee_id}/collect", response_model=FeeRecordResponse)
def collect_fee_payment(
    fee_id: str,
    payload: FeeCollectRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "accountant")),
    db: Session = Depends(get_db)
):
    fee = db.query(FeeRecord).filter(FeeRecord.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Fee record '{fee_id}' not found.")

    if caller.get("role") != "super_admin" and fee.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Fee record '{fee_id}' not found.")

    student = db.query(Student).filter(Student.id == fee.student_id).first()

    fee.amount_paid += payload.amountPaid
    fee.last_payment_date = datetime.datetime.utcnow()

    if fee.amount_paid >= fee.amount_due:
        fee.payment_status = "paid"
    elif fee.amount_paid > 0:
        fee.payment_status = "partial"

    db.commit()
    db.refresh(fee)

    return serialize_fee_record(fee, student)
