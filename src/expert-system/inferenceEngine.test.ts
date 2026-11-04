import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStudentWorkingMemory,
  runForwardChainingInference,
} from './inferenceEngine.js';
import { DEFAULT_PRODUCTION_RULES } from './knowledgeBase.js';
import { Student, Course, AttendanceRecord, GradeRecord } from '../types/index.js';

const mockCourse: Course = {
  id: 'c-web',
  code: 'IT-301',
  nameAr: 'تطوير تطبيقات الويب المتقدمة',
  nameEn: 'Advanced Web Applications',
  departmentId: 'dept-it',
  creditHours: 3,
  semester: 5,
  doctorId: 'doc-1',
  maxAbsencePercent: 25,
  lectureHall: 'Hall 302',
  timeSlot: '09:00 - 11:00',
  dayOfWeek: 'Sunday',
};

test('Forward Chaining fires Deprivation Rule (RULE-ATT-01) when course absence exceeds 25%', () => {
  const student: Student = {
    id: 's-risk',
    studentId: '202410103',
    nationalId: '30201010101234',
    nameAr: 'أحمد طارق محمود',
    nameEn: 'Ahmed Tarek Mahmoud',
    email: 'ahmed.tarek@hitu.edu.eg',
    phone: '01012345678',
    departmentId: 'dept-it',
    academicLevel: 3,
    gpa: 2.1,
    registeredCourseIds: ['c-web'],
    status: 'active',
    advisorId: 'doc-1',
    enrolledYear: 2024,
  };

  // 10 sessions: 7 absent, 3 present -> 30% attendance rate (absence 70% > 25%)
  const attendanceRecords: AttendanceRecord[] = [
    { id: '1', sessionId: 's1', studentId: 's-risk', courseId: 'c-web', date: '2026-10-01', status: 'absent', recordedBy: 'doc-1', updatedAt: '' },
    { id: '2', sessionId: 's2', studentId: 's-risk', courseId: 'c-web', date: '2026-10-08', status: 'absent', recordedBy: 'doc-1', updatedAt: '' },
    { id: '3', sessionId: 's3', studentId: 's-risk', courseId: 'c-web', date: '2026-10-15', status: 'absent', recordedBy: 'doc-1', updatedAt: '' },
    { id: '4', sessionId: 's4', studentId: 's-risk', courseId: 'c-web', date: '2026-10-22', status: 'absent', recordedBy: 'doc-1', updatedAt: '' },
    { id: '5', sessionId: 's5', studentId: 's-risk', courseId: 'c-web', date: '2026-10-29', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
    { id: '6', sessionId: 's6', studentId: 's-risk', courseId: 'c-web', date: '2026-11-05', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
    { id: '7', sessionId: 's7', studentId: 's-risk', courseId: 'c-web', date: '2026-11-12', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
  ];

  const workingMemory = buildStudentWorkingMemory(student, [mockCourse], attendanceRecords, []);
  const inference = runForwardChainingInference(workingMemory, DEFAULT_PRODUCTION_RULES);

  assert.equal(inference.riskLevel, 'critical');
  assert.equal(inference.concludedStatus, 'deprivation_risk');
  assert.ok(inference.firedRules.some((r) => r.code === 'RULE-ATT-01'));
  assert.ok(inference.explanationFacility.summaryAr.includes('حرمان رسمي'));
});

test('Forward Chaining detects Academic Honors (RULE-EXP-04) for high GPA and stellar attendance', () => {
  const topStudent: Student = {
    id: 's-top',
    studentId: '202410101',
    nationalId: '30201010109999',
    nameAr: 'مريم عادل الشريف',
    nameEn: 'Mariam Adel El-Sherif',
    email: 'mariam.adel@hitu.edu.eg',
    phone: '01123456789',
    departmentId: 'dept-it',
    academicLevel: 3,
    gpa: 3.88,
    registeredCourseIds: ['c-web'],
    status: 'active',
    advisorId: 'doc-1',
    enrolledYear: 2024,
  };

  const attendanceRecords: AttendanceRecord[] = [
    { id: '1', sessionId: 's1', studentId: 's-top', courseId: 'c-web', date: '2026-10-01', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
    { id: '2', sessionId: 's2', studentId: 's-top', courseId: 'c-web', date: '2026-10-08', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
    { id: '3', sessionId: 's3', studentId: 's-top', courseId: 'c-web', date: '2026-10-15', status: 'present', recordedBy: 'doc-1', updatedAt: '' },
  ];

  const grades: GradeRecord[] = [
    {
      id: 'g1',
      studentId: 's-top',
      courseId: 'c-web',
      semester: 'Fall 2026',
      courseworkScore: 19,
      midtermScore: 19,
      practicalScore: 19,
      finalScore: 38,
      totalScore: 95,
      letterGrade: 'A+',
      gpaPoints: 4.0,
      isApproved: true,
      updatedAt: '',
    },
  ];

  const workingMemory = buildStudentWorkingMemory(topStudent, [mockCourse], attendanceRecords, grades);
  const inference = runForwardChainingInference(workingMemory, DEFAULT_PRODUCTION_RULES);

  assert.equal(inference.concludedStatus, 'honors');
  assert.equal(inference.riskLevel, 'safe');
  assert.ok(inference.firedRules.some((r) => r.code === 'RULE-EXP-04'));
  assert.ok(inference.explanationFacility.reasoningChainAr.length > 0);
});
