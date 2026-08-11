import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from database import get_db
    from models import Announcement
    from security import require_roles
except ImportError:
    from backend.database import get_db
    from backend.models import Announcement
    from backend.security import require_roles

router = APIRouter(prefix="/api/v1/announcements", tags=["Announcements"])

class AnnouncementCreateRequest(BaseModel):
    title: str
    content: str
    targetAudience: Optional[str] = "all"  # 'all' | 'teachers' | 'students' | 'parents'

class AnnouncementResponse(BaseModel):
    id: str
    schoolId: str
    title: str
    content: str
    targetAudience: str
    postedByUserId: str
    createdAt: str

def serialize_announcement(a: Announcement) -> dict:
    return {
        "id": a.id,
        "schoolId": a.school_id,
        "title": a.title,
        "content": a.content,
        "targetAudience": a.target_audience,
        "postedByUserId": a.posted_by_user_id,
        "createdAt": a.created_at.isoformat() if a.created_at else "",
    }

@router.get("", response_model=List[AnnouncementResponse])
def list_announcements(
    school_id: Optional[str] = None,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher", "chairman", "reception", "student", "parent")),
    db: Session = Depends(get_db)
):
    target_school = caller["school_id"] if caller.get("role") != "super_admin" else (school_id or "amps-sr-sec-01")

    query = db.query(Announcement).filter(Announcement.school_id == target_school)

    role = caller.get("role")
    if role not in ["super_admin", "school_admin", "principal"]:
        query = query.filter(Announcement.target_audience.in_(["all", role]))

    results = query.order_by(Announcement.created_at.desc()).all()
    return [serialize_announcement(a) for a in results]

@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreateRequest,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
    db: Session = Depends(get_db)
):
    ann = Announcement(
        id=f"ann_{uuid.uuid4().hex[:12]}",
        school_id=caller["school_id"] if caller.get("role") != "super_admin" else "amps-sr-sec-01",
        title=payload.title.strip(),
        content=payload.content.strip(),
        target_audience=payload.targetAudience.strip().lower() if payload.targetAudience else "all",
        posted_by_user_id=caller["user_id"],
        created_at=datetime.datetime.utcnow(),
    )

    db.add(ann)
    db.commit()
    db.refresh(ann)

    return serialize_announcement(ann)

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: str,
    caller: dict = Depends(require_roles("super_admin", "school_admin", "principal")),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Announcement '{announcement_id}' not found.")

    if caller.get("role") != "super_admin" and ann.school_id.lower() != caller.get("school_id", "").lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Announcement '{announcement_id}' not found.")

    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted successfully.", "id": announcement_id}
