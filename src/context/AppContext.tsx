import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Language,
  Department,
  Course,
  Student,
  Doctor,
  LectureSession,
  AttendanceRecord,
  GradeRecord,
  ProductionRule,
  AuditLog,
  NotificationItem,
  InferenceResult,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_DOCTORS,
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_GRADES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { DEFAULT_PRODUCTION_RULES } from '../expert-system/knowledgeBase';
import {
  buildStudentWorkingMemory,
  runForwardChainingInference,
} from '../expert-system/inferenceEngine';
import { calculateGradePoints, calculateAttendancePercentage } from '../utils/academicCalculations';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  departments: Department[];
  courses: Course[];
  students: Student[];
  doctors: Doctor[];
  sessions: LectureSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  productionRules: ProductionRule[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  isProductionCleanMode: boolean;
  setProductionCleanMode: (isClean: boolean) => void;
  resetToDemoData: () => void;
  clearTestDataForProduction: () => void;
  recordAttendanceSession: (
    sessionData: {
      courseId: string;
      doctorId: string;
      date: string;
      timeSlot: string;
      hall: string;
      weekNumber: number;
      topicAr: string;
      topicEn: string;
    },
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;
  saveGrade: (
    studentId: string,
    courseId: string,
    courseworkScore: number,
    midtermScore: number,
    practicalScore: number,
    finalScore: number,
    semester: string
  ) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  toggleRuleActive: (ruleId: string) => void;
  updateProductionRule: (rule: ProductionRule) => void;
  addNewProductionRule: (rule: Omit<ProductionRule, 'id'>) => void;
  evaluateStudentWithExpertSystem: (studentId: string) => InferenceResult | null;
  evaluateAllStudents: () => InferenceResult[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  logOperation: (
    action: string,
    module: AuditLog['module'],
    detailsAr: string,
    detailsEn: string
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'uniwise_hitu_platform_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved or seed data
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return INITIAL_USERS[0]; // Admin by default
  });

  const [language, setLanguageState] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isProductionCleanMode, setIsProductionCleanMode] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [sessions, setSessions] = useState<LectureSession[]>(INITIAL_SESSIONS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [productionRules, setProductionRules] = useState<ProductionRule[]>(DEFAULT_PRODUCTION_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Sync document direction and lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const switchUserRole = (role: Role) => {
    const userForRole = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(userForRole);
    logOperation(
      `تبديل الدور النشط إلى [${role}]`,
      'SYSTEM',
      `قام المستخدم بالتبديل إلى حساب تجريبي بدور [${role}]: ${userForRole.nameAr}`,
      `User switched active role to [${role}]: ${userForRole.nameEn}`
    );
  };

  const logOperation = (
    action: string,
    module: AuditLog['module'],
    detailsAr: string,
    detailsEn: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.nameAr,
      userRole: currentUser.role,
      action,
      module,
      detailsAr,
      detailsEn,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 100)]);
  };

  const recordAttendanceSession = (
    sessionData: {
      courseId: string;
      doctorId: string;
      date: string;
      timeSlot: string;
      hall: string;
      weekNumber: number;
      topicAr: string;
      topicEn: string;
    },
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    const newSessionId = `sess-${Date.now()}`;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    const newAttendanceRecords: AttendanceRecord[] = records.map((r, idx) => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'late') lateCount++;
      else if (r.status === 'excused') excusedCount++;

      return {
        id: `att-${Date.now()}-${idx}`,
        sessionId: newSessionId,
        studentId: r.studentId,
        courseId: sessionData.courseId,
        date: sessionData.date,
        status: r.status,
        notes: r.notes || '',
        recordedBy: currentUser.id,
        updatedAt: new Date().toISOString(),
      };
    });

    const newSession: LectureSession = {
      id: newSessionId,
      ...sessionData,
      totalEnrolled: records.length,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setAttendanceRecords((prev) => [...prev, ...newAttendanceRecords]);

    const course = courses.find((c) => c.id === sessionData.courseId);
    logOperation(
      `تسجيل حضور محاضرة: ${course?.code || sessionData.courseId}`,
      'ATTENDANCE',
      `تم تسجيل حضور محاضرة الأسبوع ${sessionData.weekNumber} للمقرر [${course?.nameAr}]. الحضور: ${presentCount}، الغياب: ${absentCount}، المتأخر: ${lateCount}.`,
      `Recorded Week ${sessionData.weekNumber} attendance for [${course?.nameEn}]. Present: ${presentCount}, Absent: ${absentCount}.`
    );

    // If any student has absences, trigger notifications if threshold is reached
    for (const r of records) {
      if (r.status === 'absent') {
        const student = students.find((s) => s.id === r.studentId);
        if (student) {
          // Check student absence
          const prevCourseAtt = attendanceRecords.filter((rec) => rec.studentId === student.id && rec.courseId === sessionData.courseId);
          const allCount = prevCourseAtt.length + 1;
          const absentTotal = prevCourseAtt.filter((rec) => rec.status === 'absent').length + 1;
          const rate = ((allCount - absentTotal) / allCount) * 100;
          if (rate <= 75) {
            // Deprivation warning notification
            const notif: NotificationItem = {
              id: `notif-${Date.now()}-${r.studentId}`,
              recipientId: r.studentId,
              recipientRole: 'student',
              titleAr: `إنذار حرمان فوري: ${course?.code}`,
              titleEn: `Immediate Deprivation Alert: ${course?.code}`,
              messageAr: `بلغت نسبة غيابك في مقرر ${course?.nameAr} أكثر من 25%. تم إخطار المرشد الأكاديمي.`,
              messageEn: `Your absence in ${course?.nameEn} reached over 25%. Academic advisor notified.`,
              type: 'danger',
              read: false,
              createdAt: new Date().toISOString(),
              linkTab: 'attendance',
            };
            setNotifications((prev) => [notif, ...prev]);
          }
        }
      }
    }
  };

  const saveGrade = (
    studentId: string,
    courseId: string,
    courseworkScore: number,
    midtermScore: number,
    practicalScore: number,
    finalScore: number,
    semester: string
  ) => {
    const totalScore = courseworkScore + midtermScore + practicalScore + finalScore;
    const { letterGrade, gpaPoints } = calculateGradePoints(totalScore);

    const existingIndex = grades.findIndex((g) => g.studentId === studentId && g.courseId === courseId);
    const newGrade: GradeRecord = {
      id: existingIndex >= 0 ? grades[existingIndex].id : `grade-${Date.now()}`,
      studentId,
      courseId,
      semester,
      courseworkScore,
      midtermScore,
      practicalScore,
      finalScore,
      totalScore,
      letterGrade,
      gpaPoints,
      isApproved: true,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      setGrades((prev) => {
        const updated = [...prev];
        updated[existingIndex] = newGrade;
        return updated;
      });
    } else {
      setGrades((prev) => [...prev, newGrade]);
    }

    logOperation(
      'تحديث درجات طالب',
      'GRADES',
      `تم رصد درجات الطالب في المقرر (المجموع: ${totalScore}/100، التقدير: ${letterGrade}).`,
      `Updated student grade for course (Total: ${totalScore}/100, Letter: ${letterGrade}).`
    );
  };

  const addStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      ...newStudentData,
    };
    setStudents((prev) => [newStudent, ...prev]);
    logOperation(
      `إضافة طالب جديد: ${newStudent.nameAr}`,
      'STUDENTS',
      `تم قيد الطالب بالرقم الجامعي [${newStudent.studentId}] في قسم [${newStudent.departmentId}].`,
      `Registered new student [${newStudent.studentId}] in department [${newStudent.departmentId}].`
    );
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logOperation(
      'تعديل بيانات طالب',
      'STUDENTS',
      `تم تحديث بيانات الطالب ذو المعرف [${id}].`,
      `Updated student profile with ID [${id}].`
    );
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logOperation(
      `حذف سجل طالب: ${target?.nameAr || id}`,
      'STUDENTS',
      `تم حذف سجل الطالب [${target?.studentId || id}] من قاعدة البيانات.`,
      `Deleted student record [${target?.studentId || id}] from database.`
    );
  };

  const addCourse = (newCourseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      ...newCourseData,
    };
    setCourses((prev) => [...prev, newCourse]);
    logOperation(
      `إضافة مقرر جديد: ${newCourse.code}`,
      'COURSES',
      `تم إنشاء المقرر [${newCourse.code} - ${newCourse.nameAr}] بعدد ساعات [${newCourse.creditHours}].`,
      `Created course [${newCourse.code} - ${newCourse.nameEn}] with [${newCourse.creditHours}] credits.`
    );
  };

  const addDepartment = (newDeptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      ...newDeptData,
    };
    setDepartments((prev) => [...prev, newDept]);
    logOperation(
      `إضافة قسم تكنولوجي: ${newDept.nameAr}`,
      'SYSTEM',
      `تم اعتماد قسم [${newDept.code} - ${newDept.nameAr}] في هيكل جامعة حلوان التكنولوجية الدولية.`,
      `Approved department [${newDept.code}] in HITU structure.`
    );
  };

  const toggleRuleActive = (ruleId: string) => {
    setProductionRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
    const rule = productionRules.find((r) => r.id === ruleId);
    logOperation(
      `تغيير حالة قاعدة بالنظام الخبير: ${rule?.code}`,
      'EXPERT_SYSTEM',
      `تم ${rule?.active ? 'تعطيل' : 'تفعيل'} القاعدة [${rule?.code}] في محرك الاستدلال.`,
      `Toggled rule [${rule?.code}] in inference engine.`
    );
  };

  const updateProductionRule = (updatedRule: ProductionRule) => {
    setProductionRules((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    );
    logOperation(
      `تعديل قاعدة في قاعدة المعرفة: ${updatedRule.code}`,
      'EXPERT_SYSTEM',
      `تم تحديث شروط ومعايير القاعدة [${updatedRule.code}] بواسطة الخبير الأكاديمي.`,
      `Updated knowledge base rule [${updatedRule.code}] by academic expert.`
    );
  };

  const addNewProductionRule = (newRuleData: Omit<ProductionRule, 'id'>) => {
    const newRule: ProductionRule = {
      id: `rule-${Date.now()}`,
      ...newRuleData,
    };
    setProductionRules((prev) => [newRule, ...prev]);
    logOperation(
      `إضافة قاعدة جديدة بقاعدة المعرفة: ${newRule.code}`,
      'EXPERT_SYSTEM',
      `تمت إضافة القاعدة [${newRule.code} - ${newRule.nameAr}] إلى شجرة الاستدلال.`,
      `Added new production rule [${newRule.code}] to knowledge base.`
    );
  };

  const evaluateStudentWithExpertSystem = (studentId: string): InferenceResult | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const workingMemory = buildStudentWorkingMemory(student, courses, attendanceRecords, grades);
    const result = runForwardChainingInference(workingMemory, productionRules);

    // If status changed, update student
    if (student.status !== result.concludedStatus) {
      updateStudent(student.id, { status: result.concludedStatus });
    }

    return result;
  };

  const evaluateAllStudents = (): InferenceResult[] => {
    return students.map((s) => {
      const workingMemory = buildStudentWorkingMemory(s, courses, attendanceRecords, grades);
      return runForwardChainingInference(workingMemory, productionRules);
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    setSessions(INITIAL_SESSIONS);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setGrades(INITIAL_GRADES);
    setDepartments(INITIAL_DEPARTMENTS);
    setCourses(INITIAL_COURSES);
    setDoctors(INITIAL_DOCTORS);
    setProductionRules(DEFAULT_PRODUCTION_RULES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setIsProductionCleanMode(false);
    logOperation(
      'استعادة بيانات العرض التجريبية المعتمدة',
      'SYSTEM',
      'تمت استعادة سيناريو العرض التجريبي المعتمد لجامعة حلوان التكنولوجية الدولية (HITU).',
      'Reset system to verified HITU demonstration scenario.'
    );
  };

  const clearTestDataForProduction = () => {
    setStudents([]);
    setSessions([]);
    setAttendanceRecords([]);
    setGrades([]);
    setIsProductionCleanMode(true);
    logOperation(
      'تجهيز بيئة التشغيل النظيفة (Production Readiness)',
      'SYSTEM',
      'تم تنظيف جميع سجلات الطلاب ودرجات الاختبار وسجلات الغياب التجريبية تمهيداً لاستيراد بيانات الجامعة الرسمية.',
      'Cleared all synthetic student, attendance, and grade test records for official university deployment.'
    );
  };

  const value = {
    currentUser,
    setCurrentUser,
    switchUserRole,
    language,
    setLanguage,
    toggleLanguage,
    activeTab,
    setActiveTab,
    departments,
    courses,
    students,
    doctors,
    sessions,
    attendanceRecords,
    grades,
    productionRules,
    auditLogs,
    notifications,
    isProductionCleanMode,
    setProductionCleanMode: setIsProductionCleanMode,
    resetToDemoData,
    clearTestDataForProduction,
    recordAttendanceSession,
    saveGrade,
    addStudent,
    updateStudent,
    deleteStudent,
    addCourse,
    addDepartment,
    toggleRuleActive,
    updateProductionRule,
    addNewProductionRule,
    evaluateStudentWithExpertSystem,
    evaluateAllStudents,
    markNotificationRead,
    markAllNotificationsRead,
    logOperation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
