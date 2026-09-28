export type UserRole = 'teacher' | 'school_admin' | 'super_admin';

export interface TeacherAssignment {
  grade: string;
  stream?: string;
  subject: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  designation: string;
  tscNumber?: string;
  nationalId?: string;
  qualifications?: string;
  specialization?: string;
  teachingExperienceYears?: number;
  joiningDate?: string;
  department?: string;
  primarySubject?: string;
  assignedClass?: string;
  backgroundBio?: string;
  emergencyContact?: string;
  assignments: TeacherAssignment[];
  avatar?: string;
  username?: string;
  password?: string;
  biometricsEnrolled?: boolean;
  biometricCredentialId?: string;
}

export interface LearnerComment {
  generalComment: string;
  classTeacherComment: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Learner {
  id: string;
  admNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade: string; // e.g. "Grade 7", "Grade 8", "Grade 9"
  stream?: string;
  gender: 'M' | 'F';
  academicYear: string;
  attendanceRate?: number; // legacy optional
  status: 'Active' | 'Archived' | 'Graduated';
  photo?: string;
  guardianName?: string;
  guardianPhone?: string;
  dob?: string;
  upiNumber?: string;
  specialNeeds?: string;
  comments?: LearnerComment;
}

export interface MarkEntry {
  id: string;
  learnerId: string;
  admNo: string;
  grade: string;
  stream?: string;
  subject: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  scoreOutOf100?: number | null;
  markOutOf72?: number | null;
  points: number | null; // 1 to 8
  assessmentLevel: string; // EE1, EE2, ME1, ME2, AE1, AE2, BE1, BE2
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface AssessmentLevelConfig {
  code: string;
  name: string;
  minMark: number;
  maxMark: number;
  points: number;
  description: string;
  colorClass: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: string;
  date: string;
  author: string;
  priority?: 'high' | 'medium' | 'low';
  isNew?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category?: string;
  type?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export type SchoolEvent = CalendarEvent;

export interface SchoolDocument {
  id: string;
  title: string;
  category: string;
  fileName?: string;
  fileSize: string;
  dateUploaded?: string;
  updatedAt?: string;
  uploadedBy?: string;
  author?: string;
  authorizedRoles?: UserRole[];
  accessLevel?: 'public' | 'staff' | 'admin';
  fileType?: string;
  status?: 'Active' | 'Archived';
}

export interface AuditLog {
  id: string;
  timestamp?: string;
  date?: string;
  time?: string;
  userId?: string;
  userName?: string;
  user?: string;
  userRole: UserRole;
  action: string;
  grade?: string;
  stream?: string;
  subject?: string;
  learnerName?: string;
  admNo?: string;
  recordAffected?: string;
  previousMark?: number | null;
  newMark?: number | null;
  details?: string;
}

export type AuditLogEntry = AuditLog;

export interface TeacherActivity {
  id: string;
  action: string;
  time: string;
  category: 'marks' | 'report' | 'document' | 'circular';
  details?: string;
}

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface TimetablePeriodDef {
  periodNumber: number; // 1 to 8
  label: string; // 'Period 1', 'Period 2', ...
  startTime: string; // '8:00'
  endTime: string; // '8:40'
  timeRange: string; // '8:00 to 8:40'
  isBreak?: boolean;
  breakType?: 'short_break' | 'tea_break' | 'lunch';
}

export interface TimetableLesson {
  id: string;
  day: TimetableDay;
  periodNumber: number; // 1 to 8
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  subject: string;
  teacherId?: string;
  teacherName?: string;
  isDouble?: boolean; // For Integrated Science double lesson
  room?: string;
}

export interface TimetableData {
  academicYear: string;
  term: string;
  lessons: TimetableLesson[];
  updatedAt: string;
  generatedBy?: string;
}
