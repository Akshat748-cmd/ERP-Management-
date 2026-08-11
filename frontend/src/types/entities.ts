import { Role } from '@/config/permissions';

export interface User {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId: string;
  rollNumber: string;
  admissionNumber: string;
  fullName: string;
  gradeClass: string;
  section: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  parentIds: string[];
  address: string;
  emergencyContact: string;
  status: 'active' | 'graduated' | 'transferred' | 'withdrawn';
}

export interface Teacher {
  id: string;
  schoolId: string;
  userId: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  department: string;
  subjects: string[];
  assignedClasses: string[];
  qualification: string;
  joiningDate: string;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface Parent {
  id: string;
  schoolId: string;
  userId: string;
  fullName: string;
  relationship: 'father' | 'mother' | 'guardian';
  occupation?: string;
  email: string;
  phone: string;
  studentIds: string[];
  address: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  markedByTeacherId: string;
  remarks?: string;
}

export interface Fee {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'partially_paid';
  paidAmount: number;
  paymentMethod?: 'cash' | 'online' | 'cheque' | 'bank_transfer';
  transactionId?: string;
  paidAt?: string;
}

export interface ResultSubject {
  subjectName: string;
  maxMarks: number;
  obtainedMarks: number;
  grade?: string;
}

export interface Result {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  examTitle: string; // e.g., Mid-Term 2026, Annual Exam
  term: string;
  academicYear: string;
  subjects: ResultSubject[];
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
  published: boolean;
}
