export type Role = 'student' | 'doctor' | 'admin' | 'expert';

export type Language = 'ar' | 'en';

export type StudentStatus = 
  | 'active'              // نشط - منتظم
  | 'needs_review'        // بحاجة لمراجعة أكاديمية
  | 'early_warning'       // إنذار مبكر
  | 'attendance_warning'  // إنذار غياب
  | 'deprivation_risk'    // خطر حرمان من الامتحان
  | 'academic_probation'  // إنذار أكاديمي
  | 'honors';             // لوحة الشرف الأكاديمي

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface User {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  departmentId?: string;
  studentId?: string; // If student
  title?: string;     // If doctor/admin
}

export interface Department {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  headOfDepartmentAr: string;
  headOfDepartmentEn: string;
  establishedYear: number;
}

export interface Course {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  departmentId: string;
  creditHours: number;
  semester: number; // 1 to 8
  doctorId: string;
  maxAbsencePercent: number; // standard university bylaw: 25%
  lectureHall: string;
  timeSlot: string;
  dayOfWeek: string;
}

export interface Student {
  id: string;
  studentId: string; // Official HITU ID e.g. 202410101
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  departmentId: string;
  academicLevel: number; // 1, 2, 3, 4
  gpa: number; // 0.00 to 4.00
  registeredCourseIds: string[];
  status: StudentStatus;
  advisorId: string;
  enrolledYear: number;
  address?: string;
}

export interface Doctor {
  id: string;
  doctorCode: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  departmentId: string;
  titleAr: string; // أستاذ دكتور / دكتور / مدرس
  titleEn: string;
  officeHours: string;
  assignedCourseIds: string[];
}

export interface LectureSession {
  id: string;
  courseId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  hall: string;
  weekNumber: number;
  topicAr: string;
  topicEn: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  status: 'completed' | 'in_progress' | 'scheduled';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string; // student foreign key
  courseId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string; // doctor/admin id
  updatedAt: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  semester: string;
  courseworkScore: number; // out of 20
  midtermScore: number;    // out of 20
  practicalScore: number;  // out of 20
  finalScore: number;      // out of 40
  totalScore: number;      // out of 100
  letterGrade: string;     // A+, A, B+, B, C+, C, D+, D, F
  gpaPoints: number;       // 0.0 to 4.0
  isApproved: boolean;
  updatedAt: string;
}

export interface RuleCondition {
  field: 
    | 'overall_attendance_rate'
    | 'course_attendance_rate'
    | 'consecutive_absences'
    | 'gpa'
    | 'midterm_score'
    | 'coursework_score'
    | 'failed_courses_count';
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=';
  value: number;
  courseSpecific?: boolean;
}

export interface ProductionRule {
  id: string;
  code: string; // e.g. RULE-ATT-01, RULE-EXP-01
  nameAr: string;
  nameEn: string;
  category: 'academic_risk' | 'attendance_deprivation' | 'early_warning' | 'excellence' | 'intervention';
  conditionDescriptionAr: string;
  conditionDescriptionEn: string;
  conditions: RuleCondition[];
  consequenceStatus: StudentStatus;
  riskLevel: RiskLevel;
  recommendationsAr: string[];
  recommendationsEn: string[];
  approvedByUniversity: boolean;
  active: boolean;
  priority: number; // Higher number = higher precedence
  version: string;
}

export interface InferenceTraceStep {
  ruleId: string;
  ruleCode: string;
  ruleNameAr: string;
  ruleNameEn: string;
  conditionsEvaluated: {
    field: string;
    operator: string;
    threshold: number;
    actualValue: number;
    passed: boolean;
    detailsAr: string;
    detailsEn: string;
  }[];
  fired: boolean;
  consequenceStatus?: StudentStatus;
  riskLevel?: RiskLevel;
}

export interface StudentWorkingMemory {
  student: Student;
  overallAttendanceRate: number; // percentage e.g. 84.5
  totalSessionsScheduled: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  courseAttendance: Record<string, {
    courseId: string;
    courseCode: string;
    courseNameAr: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
    consecutiveAbsences: number;
  }>;
  grades: Record<string, GradeRecord>;
  averageMidterm: number;
  failedCoursesCount: number;
}

export interface InferenceResult {
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  evaluationDate: string;
  workingMemory: StudentWorkingMemory;
  traceSteps: InferenceTraceStep[];
  firedRules: ProductionRule[];
  concludedStatus: StudentStatus;
  riskLevel: RiskLevel;
  explanationFacility: {
    summaryAr: string;
    summaryEn: string;
    evidencePointsAr: string[];
    evidencePointsEn: string[];
    reasoningChainAr: string[];
    reasoningChainEn: string[];
    recommendationsAr: string[];
    recommendationsEn: string[];
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: 'ATTENDANCE' | 'STUDENTS' | 'EXPERT_SYSTEM' | 'GRADES' | 'COURSES' | 'SYSTEM' | 'IMPORT';
  detailsAr: string;
  detailsEn: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientRole?: Role;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}
