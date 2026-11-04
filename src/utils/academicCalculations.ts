import { AttendanceRecord, GradeRecord } from '../types';

/**
 * Calculates raw attendance and absence percentages.
 * 2 late arrivals are equivalent to 1 absence (each late = 0.5 present).
 */
export function calculateAttendancePercentage(
  present: number,
  late: number,
  excused: number,
  totalSessions: number
): { attendanceRate: number; absenceRate: number } {
  if (totalSessions <= 0) {
    return { attendanceRate: 100, absenceRate: 0 };
  }

  // Weight: present = 1, late = 0.5, excused = 0.5 or strictly counted towards excused absence
  const effectivePresent = present + late * 0.5;
  const attendanceRate = Math.min(100, Math.max(0, (effectivePresent / totalSessions) * 100));
  const absenceRate = Math.max(0, 100 - attendanceRate);

  return {
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    absenceRate: Math.round(absenceRate * 10) / 10,
  };
}

/**
 * HITU Technological Universities Official Absence Warning Thresholds
 * - Safe: < 10%
 * - Warning 1: >= 10% and < 15%
 * - Warning 2: >= 15% and < 25%
 * - Deprivation / Denial of Exam: >= 25%
 */
export type AbsenceWarningTier = 'safe' | 'warning_1' | 'warning_2' | 'deprivation';

export function getAbsenceWarningTier(absenceRate: number): {
  tier: AbsenceWarningTier;
  labelAr: string;
  labelEn: string;
  colorClass: string;
  severity: number;
} {
  if (absenceRate >= 25) {
    return {
      tier: 'deprivation',
      labelAr: 'حرمان من الامتحان النهائي (تجاوز 25%)',
      labelEn: 'Exam Deprivation (Exceeded 25%)',
      colorClass: 'bg-red-100 text-red-800 border-red-300',
      severity: 3,
    };
  }
  if (absenceRate >= 15) {
    return {
      tier: 'warning_2',
      labelAr: 'إنذار غياب ثانٍ (15% فأكثر)',
      labelEn: 'Second Absence Warning (>= 15%)',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      severity: 2,
    };
  }
  if (absenceRate >= 10) {
    return {
      tier: 'warning_1',
      labelAr: 'إنذار غياب أول (10% فأكثر)',
      labelEn: 'First Absence Warning (>= 10%)',
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      severity: 1,
    };
  }
  return {
    tier: 'safe',
    labelAr: 'حضور منتظم (أقل من 10%)',
    labelEn: 'Regular Attendance (< 10%)',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    severity: 0,
  };
}

/**
 * Calculates letter grade and 4.0 scale points based on Egyptian Credit Hour system
 */
export function calculateGradePoints(totalScore: number): {
  letterGrade: string;
  gpaPoints: number;
  statusAr: string;
  statusEn: string;
} {
  const score = Math.round(totalScore * 10) / 10;
  if (score >= 90) return { letterGrade: 'A+', gpaPoints: 4.0, statusAr: 'ممتاز مرتفع', statusEn: 'High Excellent' };
  if (score >= 85) return { letterGrade: 'A',  gpaPoints: 3.7, statusAr: 'ممتاز', statusEn: 'Excellent' };
  if (score >= 80) return { letterGrade: 'B+', gpaPoints: 3.3, statusAr: 'جيد جداً مرتفع', statusEn: 'High Very Good' };
  if (score >= 75) return { letterGrade: 'B',  gpaPoints: 3.0, statusAr: 'جيد جداً', statusEn: 'Very Good' };
  if (score >= 70) return { letterGrade: 'C+', gpaPoints: 2.7, statusAr: 'جيد مرتفع', statusEn: 'High Good' };
  if (score >= 65) return { letterGrade: 'C',  gpaPoints: 2.4, statusAr: 'جيد', statusEn: 'Good' };
  if (score >= 60) return { letterGrade: 'D+', gpaPoints: 2.2, statusAr: 'مقبول مرتفع', statusEn: 'High Pass' };
  if (score >= 50) return { letterGrade: 'D',  gpaPoints: 2.0, statusAr: 'مقبول', statusEn: 'Pass' };
  return { letterGrade: 'F', gpaPoints: 0.0, statusAr: 'راسب', statusEn: 'Fail' };
}

/**
 * Calculates weighted cumulative GPA from grade records and course credit hours
 */
export function calculateCumulativeGPA(
  grades: { grade: GradeRecord; creditHours: number }[]
): number {
  if (grades.length === 0) return 0.0;
  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const item of grades) {
    totalQualityPoints += item.grade.gpaPoints * item.creditHours;
    totalCredits += item.creditHours;
  }

  if (totalCredits === 0) return 0.0;
  return Math.round((totalQualityPoints / totalCredits) * 100) / 100;
}

/**
 * Compute consecutive absences in a sorted array of attendance records
 */
export function computeConsecutiveAbsences(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  // Sort by date descending (most recent first)
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let count = 0;
  for (const rec of sorted) {
    if (rec.status === 'absent') {
      count++;
    } else {
      break;
    }
  }
  return count;
}
