import sys
import os
import json
import uuid
import random
import datetime
import argparse

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from faker import Faker

try:
    from database import SessionLocal, engine, Base
    from models import (
        User, Tenant, Student, Teacher, AttendanceRecord,
        Homework, HomeworkSubmission, Result, FeeRecord
    )
except ImportError:
    from backend.database import SessionLocal, engine, Base
    from backend.models import (
        User, Tenant, Student, Teacher, AttendanceRecord,
        Homework, HomeworkSubmission, Result, FeeRecord
    )

fake = Faker('en_IN')

CLASSES = ["VI", "VII", "VIII", "IX", "X", "XI-A", "XI-B", "XII-A", "XII-B", "XI-C"]
SUBJECT_POOL = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "Hindi", "Social Science", "Computer Science", "Physical Education"
]

CLASS_AGE_MAP = {
    "VI": 11, "VII": 12, "VIII": 13, "IX": 14, "X": 15,
    "XI-A": 16, "XI-B": 16, "XI-C": 16, "XII-A": 17, "XII-B": 17
}

CLASS_FEE_MAP = {
    "VI": 12000, "VII": 12000, "VIII": 12000,
    "IX": 14000, "X": 15000,
    "XI-A": 17000, "XI-B": 17000, "XI-C": 17000,
    "XII-A": 18000, "XII-B": 18000
}

def derive_grade(pct: float) -> str:
    if pct >= 90:
        return "A+"
    elif pct >= 75:
        return "A"
    elif pct >= 60:
        return "B"
    elif pct >= 45:
        return "C"
    return "D"

def seed_demo_data(school_id: str):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if tenant exists or default
        tenant = db.query(Tenant).filter(Tenant.id == school_id).first()
        if not tenant:
            first_t = db.query(Tenant).first()
            if first_t:
                school_id = first_t.id
                print(f"[Seed] Tenant '{school_id}' selected from database.")
            else:
                school_id = "amps-sr-sec-01"
                print(f"[Seed] No tenant found in DB, using fallback school_id='{school_id}'.")

        # Idempotency check: Skip if students already exist for this school_id
        existing_students_count = db.query(Student).filter(Student.school_id == school_id).count()
        if existing_students_count > 0:
            print(f"[Seed] Students already exist ({existing_students_count}) for school_id='{school_id}'. Skipping demo data seeding.")
            return

        print(f"\n=======================================================")
        print(f"[Seed] GENERATING REALISTIC DEMO DATA FOR TENANT: '{school_id}'")
        print(f"=======================================================\n")

        # 1. Generate Teachers (20-30)
        teachers_list = []
        num_teachers = random.randint(22, 28)
        print(f"[Seed] Creating {num_teachers} Teachers...")

        for i in range(num_teachers):
            t_subjs = random.sample(SUBJECT_POOL, k=random.randint(1, 3))
            t_classes = random.sample(CLASSES, k=random.randint(2, 4))

            teacher = Teacher(
                id=f"tch_{uuid.uuid4().hex[:12]}",
                school_id=school_id,
                full_name=fake.name(),
                employee_code=f"EMP{i+1:03d}",
                subjects=json.dumps(t_subjs),
                classes_assigned=json.dumps(t_classes),
                phone=fake.phone_number()[:15],
                email=fake.email(),
                is_active=True,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(teacher)
            teachers_list.append(teacher)

        db.flush()

        # 2. Generate Students (25-40 per class across 10 classes)
        students_list = []
        print(f"[Seed] Creating Students across {len(CLASSES)} classes...")

        demo_student_user = db.query(User).filter(User.school_id == school_id, User.role == "student").first()

        for cls_idx, cls in enumerate(CLASSES):
            num_in_class = random.randint(28, 35)
            target_age = CLASS_AGE_MAP.get(cls, 14)

            for roll_idx in range(1, num_in_class + 1):
                dob = datetime.datetime.utcnow() - datetime.timedelta(days=365 * target_age + random.randint(-180, 180))
                admission_date = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(365, 1460))

                sec = cls.split("-")[1] if "-" in cls else "A"

                if cls_idx == 0 and roll_idx == 1 and demo_student_user:
                    std_id = demo_student_user.id
                    std_name = demo_student_user.full_name
                else:
                    std_id = f"std_{uuid.uuid4().hex[:12]}"
                    std_name = fake.name()

                student = Student(
                    id=std_id,
                    school_id=school_id,
                    full_name=std_name,
                    roll_number=f"{roll_idx:02d}",
                    class_name=cls,
                    section=sec,
                    date_of_birth=dob,
                    gender=random.choice(["Male", "Female"]),
                    parent_user_id=None,
                    admission_date=admission_date,
                    is_active=True,
                    created_at=datetime.datetime.utcnow(),
                )
                db.add(student)
                students_list.append(student)

        db.flush()
        print(f"[Seed] Created {len(students_list)} Students successfully.")

        # 3. Generate Attendance (Last 30 Calendar Days, Weekdays Only)
        print(f"[Seed] Generating Attendance records for past 30 days...")
        today = datetime.date.today()
        attendance_records_count = 0

        past_days = [today - datetime.timedelta(days=d) for d in range(30)]
        weekdays = [d for d in past_days if d.weekday() < 5]  # Skip Saturday (5) & Sunday (6)

        for std in students_list:
            for d in weekdays:
                date_str = d.strftime("%Y-%m-%d")
                att_status = random.choices(["present", "absent", "late"], weights=[92, 5, 3])[0]
                marker = random.choice(teachers_list).id

                att = AttendanceRecord(
                    id=f"att_{uuid.uuid4().hex[:12]}",
                    school_id=school_id,
                    student_id=std.id,
                    class_name=std.class_name,
                    date=date_str,
                    status=att_status,
                    marked_by_user_id=marker,
                    marked_at=datetime.datetime.utcnow(),
                )
                db.add(att)
                attendance_records_count += 1

        db.flush()
        print(f"[Seed] Created {attendance_records_count} Attendance records.")

        # 4. Generate Homework & Submissions (15-20 Homeworks)
        print(f"[Seed] Creating Homework assignments & Student Submissions...")
        num_homeworks = random.randint(15, 20)
        homework_count = 0
        submission_count = 0

        feedbacks = [
            "Excellent work!", "Very neat presentation.", "Good effort, keep it up.",
            "Well done!", "Accurate solutions.", "Satisfactory submission."
        ]

        for _ in range(num_homeworks):
            teacher = random.choice(teachers_list)
            try:
                t_classes = json.loads(teacher.classes_assigned)
            except Exception:
                t_classes = CLASSES
            try:
                t_subjs = json.loads(teacher.subjects)
            except Exception:
                t_subjs = SUBJECT_POOL

            chosen_cls = random.choice(t_classes) if t_classes else random.choice(CLASSES)
            chosen_subj = random.choice(t_subjs) if t_subjs else random.choice(SUBJECT_POOL)
            hw_status = random.choices(["published", "draft"], weights=[85, 15])[0]

            due_date = (today + datetime.timedelta(days=random.randint(-5, 5))).strftime("%Y-%m-%d")

            hw = Homework(
                id=f"hw_{uuid.uuid4().hex[:12]}",
                school_id=school_id,
                title=f"{chosen_subj} Assignment: Chapter {random.randint(1, 10)} Exercises",
                subject=chosen_subj,
                class_name=chosen_cls,
                description=f"Complete exercise problems 1 through {random.randint(5, 15)} in notebook.",
                created_by_teacher_id=teacher.id,
                due_date=due_date,
                status=hw_status,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(hw)
            homework_count += 1
            db.flush()

            # Submissions for published homework
            if hw_status == "published":
                class_students = [s for s in students_list if s.class_name == chosen_cls]
                if class_students:
                    sample_size = int(len(class_students) * random.uniform(0.60, 0.90))
                    submitted_students = random.sample(class_students, k=min(sample_size, len(class_students)))

                    for s_std in submitted_students:
                        grade_val = random.choices(["A+", "A", "B+", "B", "C"], weights=[30, 40, 15, 10, 5])[0]
                        sub = HomeworkSubmission(
                            id=f"sub_{uuid.uuid4().hex[:12]}",
                            homework_id=hw.id,
                            student_id=s_std.id,
                            submission_text="Completed solution uploaded to digital portal.",
                            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 3)),
                            grade=grade_val,
                            feedback=random.choice(feedbacks),
                        )
                        db.add(sub)
                        submission_count += 1

        db.flush()
        print(f"[Seed] Created {homework_count} Homeworks & {submission_count} Submissions.")

        # 5. Generate Examination Results (2 exams per student: Term 1 Mid-Term & Term 1 Final)
        print(f"[Seed] Generating Examination Results...")
        results_count = 0

        for std in students_list:
            for exam_title in ["Term 1 Mid-Term", "Term 1 Final"]:
                is_midterm = (exam_title == "Term 1 Mid-Term")
                res_status = "published" if is_midterm else random.choices(["published", "draft"], weights=[70, 30])[0]

                # Generate 5 subjects for this class
                subj_scores = []
                for subj_name in random.sample(SUBJECT_POOL, k=5):
                    obtained = random.randint(60, 99) if random.random() > 0.1 else random.randint(35, 59)
                    subj_scores.append({
                        "subjectName": subj_name,
                        "maxMarks": 100,
                        "obtainedMarks": obtained
                    })

                total_obtained = sum(s["obtainedMarks"] for s in subj_scores)
                total_max = sum(s["maxMarks"] for s in subj_scores)
                pct = round((total_obtained / total_max) * 100, 1)
                grade_str = derive_grade(pct)

                res = Result(
                    id=f"res_{uuid.uuid4().hex[:12]}",
                    school_id=school_id,
                    student_id=std.id,
                    exam_name=exam_title,
                    class_name=std.class_name,
                    subject_scores=json.dumps(subj_scores),
                    aggregate_score=total_obtained,
                    total_max_marks=total_max,
                    percentage=int(pct),
                    grade=grade_str,
                    status=res_status,
                    entered_by_teacher_id=random.choice(teachers_list).id,
                    published_by_principal_id="usr_principal" if res_status == "published" else None,
                    published_at=datetime.datetime.utcnow() if res_status == "published" else None,
                    created_at=datetime.datetime.utcnow(),
                )
                db.add(res)
                results_count += 1

        db.flush()
        print(f"[Seed] Created {results_count} Result records.")

        # 6. Generate Fee Records (2 terms: Q2 Tuition & Q3 Tuition)
        print(f"[Seed] Generating Fee Records...")
        fee_count = 0

        for std in students_list:
            base_fee = CLASS_FEE_MAP.get(std.class_name, 15000)

            for term_name in ["Q2 Tuition", "Q3 Tuition"]:
                pay_status = random.choices(["paid", "pending", "partial"], weights=[75, 15, 10])[0]

                if pay_status == "paid":
                    paid_amt = base_fee
                    last_pay_date = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(5, 45))
                elif pay_status == "partial":
                    paid_amt = base_fee // 2
                    last_pay_date = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 15))
                else:
                    paid_amt = 0
                    last_pay_date = None

                due_date = "2026-09-30" if term_name == "Q2 Tuition" else "2026-12-31"

                fee = FeeRecord(
                    id=f"fee_{uuid.uuid4().hex[:12]}",
                    school_id=school_id,
                    student_id=std.id,
                    fee_term=term_name,
                    title=f"{term_name} Dues",
                    amount_due=base_fee,
                    amount_paid=paid_amt,
                    payment_status=pay_status,
                    due_date=due_date,
                    last_payment_date=last_pay_date,
                    created_at=datetime.datetime.utcnow(),
                )
                db.add(fee)
                fee_count += 1

        db.commit()

        # Print Final Summary Table
        print(f"\n=======================================================")
        print(f" DEMO DATA SEEDING COMPLETE FOR TENANT: '{school_id}'")
        print(f"=======================================================")
        print(f" {'TABLE':<25} | {'COUNT POPULATED'}")
        print("-" * 50)
        print(f" {'Teachers':<25} | {num_teachers}")
        print(f" {'Students':<25} | {len(students_list)}")
        print(f" {'Attendance Records':<25} | {attendance_records_count}")
        print(f" {'Homework Assignments':<25} | {homework_count}")
        print(f" {'Homework Submissions':<25} | {submission_count}")
        print(f" {'Result Records':<25} | {results_count}")
        print(f" {'Fee Records':<25} | {fee_count}")
        print(f"=======================================================\n")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] Failed to seed demo data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed realistic demo ERP data for a tenant school.")
    parser.add_argument("--school-id", type=str, default=None, help="Tenant school ID (slug)")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)

    # Determine default tenant if not specified
    target_school = args.school_id
    if not target_school:
        db_temp = SessionLocal()
        try:
            first_t = db_temp.query(Tenant).first()
            target_school = first_t.id if first_t else "amps-sr-sec-01"
        finally:
            db_temp.close()

    seed_demo_data(target_school)
