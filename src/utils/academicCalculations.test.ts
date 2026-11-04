import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  getAbsenceWarningTier,
  calculateGradePoints,
  calculateCumulativeGPA,
  computeConsecutiveAbsences,
} from './academicCalculations.js';
import { AttendanceRecord, GradeRecord } from '../types/index.js';

test('calculateAttendancePercentage handles normal full attendance', () => {
  const result = calculateAttendancePercentage(10, 0, 0, 10);
  assert.equal(result.attendanceRate, 100);
  assert.equal(result.absenceRate, 0);
});

test('calculateAttendancePercentage properly treats late as 0.5 attendance', () => {
  // 8 present, 2 late out of 10 = 9 effective presents = 90%
  const result = calculateAttendancePercentage(8, 2, 0, 10);
  assert.equal(result.attendanceRate, 90);
  assert.equal(result.absenceRate, 10);
});

test('getAbsenceWarningTier classifies thresholds according to university bylaws', () => {
  assert.equal(getAbsenceWarningTier(5).tier, 'safe');
  assert.equal(getAbsenceWarningTier(10).tier, 'warning_1');
  assert.equal(getAbsenceWarningTier(14.9).tier, 'warning_1');
  assert.equal(getAbsenceWarningTier(15).tier, 'warning_2');
  assert.equal(getAbsenceWarningTier(24.5).tier, 'warning_2');
  assert.equal(getAbsenceWarningTier(25).tier, 'deprivation');
  assert.equal(getAbsenceWarningTier(32).tier, 'deprivation');
});

test('calculateGradePoints accurately matches standard 4.0 scale', () => {
  const excellent = calculateGradePoints(95);
  assert.equal(excellent.letterGrade, 'A+');
  assert.equal(excellent.gpaPoints, 4.0);

  const veryGood = calculateGradePoints(78);
  assert.equal(veryGood.letterGrade, 'B');
  assert.equal(veryGood.gpaPoints, 3.0);

  const fail = calculateGradePoints(42);
  assert.equal(fail.letterGrade, 'F');
  assert.equal(fail.gpaPoints, 0.0);
});

test('calculateCumulativeGPA calculates weighted grade point average', () => {
  const sampleGrades = [
    {
      grade: { gpaPoints: 4.0 } as GradeRecord,
      creditHours: 3,
    },
    {
      grade: { gpaPoints: 3.0 } as GradeRecord,
      creditHours: 3,
    },
  ];
  // (4.0 * 3 + 3.0 * 3) / 6 = 21 / 6 = 3.5
  const gpa = calculateCumulativeGPA(sampleGrades);
  assert.equal(gpa, 3.5);
});

test('computeConsecutiveAbsences counts recent consecutive absences correctly', () => {
  const records: AttendanceRecord[] = [
    { id: '1', sessionId: 's1', studentId: 'st1', courseId: 'c1', date: '2026-10-01', status: 'present', recordedBy: 'd1', updatedAt: '' },
    { id: '2', sessionId: 's2', studentId: 'st1', courseId: 'c1', date: '2026-10-08', status: 'absent', recordedBy: 'd1', updatedAt: '' },
    { id: '3', sessionId: 's3', studentId: 'st1', courseId: 'c1', date: '2026-10-15', status: 'absent', recordedBy: 'd1', updatedAt: '' },
    { id: '4', sessionId: 's4', studentId: 'st1', courseId: 'c1', date: '2026-10-22', status: 'absent', recordedBy: 'd1', updatedAt: '' },
  ];
  // Most recent are 2026-10-22 (absent), 10-15 (absent), 10-08 (absent) -> 3 consecutive absences
  const count = computeConsecutiveAbsences(records);
  assert.equal(count, 3);
});
