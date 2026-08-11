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
  fullName: string;
  rollNumber: string;
  className: string;
  section?: string;
  dateOfBirth?: string;
  gender?: string;
  parentUserId?: string;
  admissionDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  fullName: string;
  employeeCode: string;
  subjects: string[];
  classesAssigned: string[];
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
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
  rollNumber: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  markedByUserId?: string;
  markedAt: string;
}

export interface Fee {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  feeTerm: string;
  title: string;
  amountDue: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  dueDate: string;
  lastPaymentDate?: string;
  createdAt: string;
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
  rollNumber: string;
  examName: string;
  className: string;
  subjects: ResultSubject[];
  aggregateScore: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  status: 'draft' | 'published';
  enteredByTeacherId?: string;
  publishedByPrincipalId?: string;
  publishedAt?: string;
  createdAt: string;
}
