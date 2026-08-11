import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, UniqueConstraint

try:
    from database import Base
except ImportError:
    from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # e.g., 'school_admin', 'principal', 'teacher', 'student', 'parent', 'accountant'
    school_id = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=True, nullable=False)
    password_changed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    roll_number = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    section = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    parent_user_id = Column(String, nullable=True, index=True)
    admission_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('school_id', 'roll_number', 'class_name', name='uix_student_school_roll_class'),
    )

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    employee_code = Column(String, nullable=False)
    subjects = Column(String, nullable=True)  # JSON or comma-separated string
    classes_assigned = Column(String, nullable=True)  # JSON or comma-separated string
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('school_id', 'employee_code', name='uix_teacher_school_empcode'),
    )

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    student_id = Column(String, nullable=False, index=True)
    class_name = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    status = Column(String, nullable=False)  # 'present' | 'absent' | 'late'
    marked_by_user_id = Column(String, nullable=True)
    marked_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('school_id', 'student_id', 'date', name='uix_attendance_school_student_date'),
    )

class Homework(Base):
    __tablename__ = "homework"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by_teacher_id = Column(String, nullable=True)
    due_date = Column(String, nullable=False)  # YYYY-MM-DD
    status = Column(String, default="published", nullable=False)  # 'draft' | 'published'
    is_active = Column(Boolean, default=True, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id = Column(String, primary_key=True, index=True)
    homework_id = Column(String, nullable=False, index=True)
    student_id = Column(String, nullable=False, index=True)
    submission_text = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    grade = Column(String, nullable=True)
    feedback = Column(String, nullable=True)

class Result(Base):
    __tablename__ = "results"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    student_id = Column(String, nullable=False, index=True)
    exam_name = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    subject_scores = Column(String, nullable=True)  # JSON string
    aggregate_score = Column(Integer, default=0, nullable=False)
    total_max_marks = Column(Integer, default=100, nullable=False)
    percentage = Column(Integer, default=0, nullable=False)
    grade = Column(String, nullable=True)
    status = Column(String, default="draft", nullable=False)  # 'draft' | 'published'
    entered_by_teacher_id = Column(String, nullable=True)
    published_by_principal_id = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class FeeRecord(Base):
    __tablename__ = "fee_records"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    student_id = Column(String, nullable=False, index=True)
    fee_term = Column(String, nullable=False)
    title = Column(String, nullable=False)
    amount_due = Column(Integer, default=0, nullable=False)
    amount_paid = Column(Integer, default=0, nullable=False)
    payment_status = Column(String, default="pending", nullable=False)  # 'paid' | 'pending' | 'partial'
    due_date = Column(String, nullable=False)  # YYYY-MM-DD
    last_payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    target_audience = Column(String, default="all", nullable=False)  # 'all' | 'teachers' | 'students' | 'parents'
    posted_by_user_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class ClassSchedule(Base):
    __tablename__ = "class_schedules"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    class_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    teacher_name = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    room_number = Column(String, nullable=False)
    day_of_week = Column(String, default="Monday", nullable=False)

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    domain = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    seal_url = Column(String, nullable=True)
    admin_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    exam_controller_name = Column(String, nullable=True)
    principal_name = Column(String, nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class PasswordResetAudit(Base):
    __tablename__ = "password_reset_audit"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    target_user_id = Column(String, nullable=False, index=True)
    target_email = Column(String, nullable=False)
    target_role = Column(String, nullable=False)
    reset_type = Column(String, nullable=False)  # 'self_service' | 'admin_forced'
    performed_by_user_id = Column(String, nullable=True)  # null if self-service
    performed_by_role = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class ImpersonationAudit(Base):
    __tablename__ = "impersonation_audit"

    id = Column(String, primary_key=True, index=True)
    super_admin_user_id = Column(String, nullable=False, index=True)
    super_admin_email = Column(String, nullable=False)
    target_user_id = Column(String, nullable=False, index=True)
    target_email = Column(String, nullable=False)
    target_school_id = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)

class TeacherAttendance(Base):
    """Daily self check-in record for teaching staff."""
    __tablename__ = "teacher_attendance"

    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, nullable=False, index=True)
    teacher_user_id = Column(String, nullable=False, index=True)  # FK → users.id
    teacher_name = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    status = Column(String, nullable=False)  # 'present' | 'late' | 'absent'
    check_in_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    note = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint('school_id', 'teacher_user_id', 'date', name='uix_teacher_att_school_user_date'),
    )

