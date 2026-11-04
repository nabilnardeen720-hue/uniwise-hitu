import {
  Student,
  Course,
  AttendanceRecord,
  GradeRecord,
  ProductionRule,
  StudentWorkingMemory,
  InferenceResult,
  InferenceTraceStep,
  StudentStatus,
  RiskLevel,
} from '../types';
import { calculateAttendancePercentage, computeConsecutiveAbsences } from '../utils/academicCalculations';

/**
 * Builds the dynamic Working Memory facts for a student from attendance & grades.
 */
export function buildStudentWorkingMemory(
  student: Student,
  courses: Course[],
  attendanceRecords: AttendanceRecord[],
  gradeRecords: GradeRecord[]
): StudentWorkingMemory {
  // Filter records belonging to this student
  const studentAttendance = attendanceRecords.filter((r) => r.studentId === student.id);
  const studentGrades = gradeRecords.filter((g) => g.studentId === student.id);

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalExcused = 0;

  const courseAttendance: StudentWorkingMemory['courseAttendance'] = {};

  // Initialize course attendance for all registered courses
  for (const courseId of student.registeredCourseIds) {
    const course = courses.find((c) => c.id === courseId);
    const recordsForCourse = studentAttendance.filter((r) => r.courseId === courseId);

    let cPresent = 0;
    let cAbsent = 0;
    let cLate = 0;
    let cExcused = 0;

    for (const rec of recordsForCourse) {
      if (rec.status === 'present') cPresent++;
      else if (rec.status === 'absent') cAbsent++;
      else if (rec.status === 'late') cLate++;
      else if (rec.status === 'excused') cExcused++;
    }

    totalPresent += cPresent;
    totalAbsent += cAbsent;
    totalLate += cLate;
    totalExcused += cExcused;

    const totalCourseSessions = recordsForCourse.length;
    const { attendanceRate } = calculateAttendancePercentage(cPresent, cLate, cExcused, totalCourseSessions);
    const consecutiveAbsences = computeConsecutiveAbsences(recordsForCourse);

    courseAttendance[courseId] = {
      courseId,
      courseCode: course ? course.code : courseId,
      courseNameAr: course ? course.nameAr : courseId,
      total: totalCourseSessions,
      present: cPresent,
      absent: cAbsent,
      late: cLate,
      excused: cExcused,
      rate: attendanceRate,
      consecutiveAbsences,
    };
  }

  const totalSessions = studentAttendance.length;
  const { attendanceRate: overallAttendanceRate } = calculateAttendancePercentage(
    totalPresent,
    totalLate,
    totalExcused,
    totalSessions
  );

  // Grades map
  const gradesMap: Record<string, GradeRecord> = {};
  let totalMidterm = 0;
  let midtermCount = 0;
  let failedCount = 0;

  for (const g of studentGrades) {
    gradesMap[g.courseId] = g;
    if (g.midtermScore !== undefined && g.midtermScore !== null) {
      totalMidterm += g.midtermScore;
      midtermCount++;
    }
    if (g.letterGrade === 'F' || (g.totalScore !== undefined && g.totalScore < 50)) {
      failedCount++;
    }
  }

  const averageMidterm = midtermCount > 0 ? Math.round((totalMidterm / midtermCount) * 10) / 10 : 0;

  return {
    student,
    overallAttendanceRate,
    totalSessionsScheduled: totalSessions,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    courseAttendance,
    grades: gradesMap,
    averageMidterm,
    failedCoursesCount: failedCount,
  };
}

/**
 * Compares actual value against rule condition with operator
 */
function evaluateCondition(actual: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '<':  return actual < threshold;
    case '<=': return actual <= threshold;
    case '>':  return actual > threshold;
    case '>=': return actual >= threshold;
    case '==': return actual === threshold;
    case '!=': return actual !== threshold;
    default:   return false;
  }
}

/**
 * Runs Forward Chaining on the student's working memory against active production rules.
 * Produces full InferenceTraceSteps and an Explanation Facility breakdown.
 */
export function runForwardChainingInference(
  workingMemory: StudentWorkingMemory,
  rules: ProductionRule[]
): InferenceResult {
  const activeRules = rules
    .filter((r) => r.active && r.approvedByUniversity)
    .sort((a, b) => b.priority - a.priority);

  const traceSteps: InferenceTraceStep[] = [];
  const firedRules: ProductionRule[] = [];
  const triggeredCourseNotes: { ruleCode: string; courseCode: string; courseNameAr: string; detailsAr: string; detailsEn: string }[] = [];

  for (const rule of activeRules) {
    const conditionEvaluations: InferenceTraceStep['conditionsEvaluated'] = [];
    let rulePassed = true;

    for (const condition of rule.conditions) {
      if (condition.courseSpecific) {
        // Course-specific condition: must check registered courses
        let foundViolatingCourse = false;
        let lowestRateOrScore = 100;
        let matchedCourseInfo = '';

        for (const courseId of workingMemory.student.registeredCourseIds) {
          const cAtt = workingMemory.courseAttendance[courseId];
          const cGrade = workingMemory.grades[courseId];

          let actualVal = 0;
          if (condition.field === 'course_attendance_rate') {
            actualVal = cAtt ? cAtt.rate : 100;
          } else if (condition.field === 'midterm_score') {
            actualVal = cGrade ? cGrade.midtermScore : 20;
          } else if (condition.field === 'consecutive_absences') {
            actualVal = cAtt ? cAtt.consecutiveAbsences : 0;
          }

          const passedForThisCourse = evaluateCondition(actualVal, condition.operator, condition.value);

          if (passedForThisCourse) {
            foundViolatingCourse = true;
            lowestRateOrScore = actualVal;
            matchedCourseInfo = cAtt ? `${cAtt.courseCode} (${cAtt.courseNameAr})` : courseId;
            triggeredCourseNotes.push({
              ruleCode: rule.code,
              courseCode: cAtt ? cAtt.courseCode : courseId,
              courseNameAr: cAtt ? cAtt.courseNameAr : courseId,
              detailsAr: `في المقرر [${matchedCourseInfo}]: القيمة الفعلية (${actualVal}) تطابق الشرط (${condition.operator} ${condition.value})`,
              detailsEn: `In course [${matchedCourseInfo}]: actual value (${actualVal}) satisfies condition (${condition.operator} ${condition.value})`,
            });
            break;
          }
        }

        conditionEvaluations.push({
          field: condition.field,
          operator: condition.operator,
          threshold: condition.value,
          actualValue: lowestRateOrScore,
          passed: foundViolatingCourse,
          detailsAr: foundViolatingCourse
            ? `تحقق الشرط لمقرر [${matchedCourseInfo}]: القيمة = ${lowestRateOrScore}`
            : `لم يتحقق الشرط لأي مقرر مسجل`,
          detailsEn: foundViolatingCourse
            ? `Condition matched for course [${matchedCourseInfo}]: Value = ${lowestRateOrScore}`
            : `Condition did not match for any registered course`,
        });

        if (!foundViolatingCourse) {
          rulePassed = false;
        }
      } else {
        // Global / Student-level condition
        let actualVal = 0;
        if (condition.field === 'overall_attendance_rate') {
          actualVal = workingMemory.overallAttendanceRate;
        } else if (condition.field === 'gpa') {
          actualVal = workingMemory.student.gpa;
        } else if (condition.field === 'failed_courses_count') {
          actualVal = workingMemory.failedCoursesCount;
        }

        const passed = evaluateCondition(actualVal, condition.operator, condition.value);
        conditionEvaluations.push({
          field: condition.field,
          operator: condition.operator,
          threshold: condition.value,
          actualValue: actualVal,
          passed,
          detailsAr: `المؤشر: ${condition.field} | الفعلي = ${actualVal} | المقارنة (${condition.operator} ${condition.value})`,
          detailsEn: `Field: ${condition.field} | Actual = ${actualVal} | Check (${condition.operator} ${condition.value})`,
        });

        if (!passed) {
          rulePassed = false;
        }
      }
    }

    traceSteps.push({
      ruleId: rule.id,
      ruleCode: rule.code,
      ruleNameAr: rule.nameAr,
      ruleNameEn: rule.nameEn,
      conditionsEvaluated: conditionEvaluations,
      fired: rulePassed,
      consequenceStatus: rulePassed ? rule.consequenceStatus : undefined,
      riskLevel: rulePassed ? rule.riskLevel : undefined,
    });

    if (rulePassed) {
      firedRules.push(rule);
    }
  }

  // Conflict Resolution: Pick the rule with highest priority / risk severity
  let concludedStatus: StudentStatus = 'active';
  let riskLevel: RiskLevel = 'safe';

  if (firedRules.length > 0) {
    const highestRule = firedRules[0]; // already ordered by priority desc
    concludedStatus = highestRule.consequenceStatus;
    riskLevel = highestRule.riskLevel;
  }

  // Generate Explanation Facility
  const explanation = generateExplanationFacility(workingMemory, firedRules, traceSteps, riskLevel, concludedStatus);

  return {
    studentId: workingMemory.student.id,
    studentNameAr: workingMemory.student.nameAr,
    studentNameEn: workingMemory.student.nameEn,
    evaluationDate: new Date().toISOString(),
    workingMemory,
    traceSteps,
    firedRules,
    concludedStatus,
    riskLevel,
    explanationFacility: explanation,
  };
}

/**
 * Builds the formal Explanation Facility output with Why & How reasoning
 */
function generateExplanationFacility(
  memory: StudentWorkingMemory,
  firedRules: ProductionRule[],
  traceSteps: InferenceTraceStep[],
  riskLevel: RiskLevel,
  status: StudentStatus
) {
  const evidencePointsAr: string[] = [];
  const evidencePointsEn: string[] = [];
  const reasoningChainAr: string[] = [];
  const reasoningChainEn: string[] = [];
  const recommendationsAr: string[] = [];
  const recommendationsEn: string[] = [];

  // 1. Evidence Points (Facts from Working Memory)
  evidencePointsAr.push(`نسبة الحضور الإجمالية للطالب: ${memory.overallAttendanceRate}% (${memory.totalPresent} حاضر من ${memory.totalSessionsScheduled} محاضرة مسجلة).`);
  evidencePointsEn.push(`Student overall attendance rate: ${memory.overallAttendanceRate}% (${memory.totalPresent} present out of ${memory.totalSessionsScheduled} recorded sessions).`);

  evidencePointsAr.push(`المعدل التراكمي للطالب (GPA): ${memory.student.gpa.toFixed(2)} من 4.00.`);
  evidencePointsEn.push(`Cumulative GPA: ${memory.student.gpa.toFixed(2)} out of 4.00.`);

  for (const [courseId, cAtt] of Object.entries(memory.courseAttendance)) {
    if (cAtt.rate < 85 || cAtt.absent > 1) {
      evidencePointsAr.push(`مقرر [${cAtt.courseCode} - ${cAtt.courseNameAr}]: نسبة الحضور ${cAtt.rate}% (غياب ${cAtt.absent} محاضرات، انقطاع متتالي ${cAtt.consecutiveAbsences}).`);
      evidencePointsEn.push(`Course [${cAtt.courseCode}]: Attendance rate ${cAtt.rate}% (Absent: ${cAtt.absent}, Consecutive absences: ${cAtt.consecutiveAbsences}).`);
    }
  }

  // 2. Reasoning Chain (How the inference engine evaluated)
  if (firedRules.length === 0) {
    reasoningChainAr.push('قام محرك الاستدلال بفحص جميع القواعد المعتمدة في قاعدة المعرفة؛ ولم يتطابق أي شرط سلبي أو تنبيه.');
    reasoningChainAr.push('الطالب يحافظ على معدل حضور ومعدل تراكمي ضمن النطاق الطبيعي المستقر.');
    reasoningChainEn.push('The inference engine evaluated all approved rules in the knowledge base; no adverse warning conditions were met.');
    reasoningChainEn.push('The student maintains attendance and GPA within the normal expected range.');
  } else {
    for (const rule of firedRules) {
      reasoningChainAr.push(`تم تفعيل القاعدة [${rule.code} - ${rule.nameAr}] بأولوية (${rule.priority}): انطبقت شروط [${rule.conditionDescriptionAr}].`);
      reasoningChainEn.push(`Rule [${rule.code} - ${rule.nameEn}] fired with priority (${rule.priority}): Conditions matched [${rule.conditionDescriptionEn}].`);

      for (const rec of rule.recommendationsAr) {
        if (!recommendationsAr.includes(rec)) recommendationsAr.push(rec);
      }
      for (const rec of rule.recommendationsEn) {
        if (!recommendationsEn.includes(rec)) recommendationsEn.push(rec);
      }
    }
  }

  // 3. Executive Summaries
  let summaryAr = '';
  let summaryEn = '';

  if (riskLevel === 'critical') {
    summaryAr = `حالة حرجة: الطالب معرض لقرار حرمان رسمي في مقرر أو أكثر بسبب تجاوز سقف الغياب اللائحي (25%). يلزم اتخاذ إجراء إداري فوري وفق لائحة جامعة حلوان التكنولوجية الدولية.`;
    summaryEn = `Critical Condition: Student is at risk of official exam deprivation in one or more courses due to exceeding the statutory 25% absence cap under HITU bylaws. Immediate administrative action required.`;
  } else if (riskLevel === 'high') {
    summaryAr = `مستوى خطورة مرتفع: يواجه الطالب تعثراً يستدعي تدخلاً إرشادياً عاجلاً نظراً لتزامن تدني الحضور أو انخفاض درجات الميدتيرم مع المعدل الأكاديمي.`;
    summaryEn = `High Risk Level: Student faces academic distress requiring prompt counseling intervention due to concurrent attendance drop, low midterm scores, or GPA probation.`;
  } else if (riskLevel === 'moderate') {
    summaryAr = `إنذار مبكر: رصد مؤشرات أولية لتكرار الغياب أو تذبذب الأداء تتطلب توجيه تنبيه إلكتروني للطالب ومتابعة دورية.`;
    summaryEn = `Early Warning: Initial indicators of attendance dips or fluctuating performance detected, requiring automated notification and regular follow-up.`;
  } else {
    summaryAr = `حالة آمنة ومستقرة: مؤشرات الحضور والدرجات مطابقة للمعايير الأكاديمية المعتمدة في الكلية.`;
    summaryEn = `Safe and Stable Condition: Attendance metrics and academic grades fully satisfy approved college standards.`;
  }

  return {
    summaryAr,
    summaryEn,
    evidencePointsAr,
    evidencePointsEn,
    reasoningChainAr,
    reasoningChainEn,
    recommendationsAr,
    recommendationsEn,
  };
}
