import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  GraduationCap,
  CalendarCheck,
  Award,
  AlertTriangle,
  Printer,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { calculateAttendancePercentage, getAbsenceWarningTier } from '../../utils/academicCalculations';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
  onOpenExpert?: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onOpenExpert,
}) => {
  const { students, courses, departments, attendanceRecords, grades, language } = useApp();

  if (!studentId) return null;

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const department = departments.find((d) => d.id === student.departmentId);

  // Student specific records
  const studentAttendance = attendanceRecords.filter((r) => r.studentId === student.id);
  const studentGrades = grades.filter((g) => g.studentId === student.id);

  // Attendance aggregates
  let present = 0; let absent = 0; let late = 0; let excused = 0;
  for (const r of studentAttendance) {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'late') late++;
    else if (r.status === 'excused') excused++;
  }
  const { attendanceRate, absenceRate } = calculateAttendancePercentage(
    present,
    late,
    excused,
    studentAttendance.length
  );
  const warningTier = getAbsenceWarningTier(absenceRate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* University Header (Matches official print format) */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <span>جامعة حلوان التكنولوجية الدولية (HITU)</span>
              <span>•</span>
              <span>السجل الأكاديمي الموحد</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {language === 'ar' ? student.nameAr : student.nameEn}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              aria-label="طباعة السجل الأكاديمي"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{language === 'ar' ? 'طباعة السجل' : 'Print Transcript'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Identity & Basic Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{student.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'القسم التكنولوجي' : 'Department'}</span>
              <span className="font-semibold text-slate-800">{department?.nameAr || student.departmentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'المستوى الدراسي' : 'Academic Level'}</span>
              <span className="font-semibold text-slate-800">{language === 'ar' ? `المستوى ${student.academicLevel}` : `Level ${student.academicLevel}`}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'المعدل التراكمي (GPA)' : 'CGPA'}</span>
              <span className="font-extrabold text-indigo-700 text-sm">{student.gpa.toFixed(2)} / 4.00</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'الرقم القومي' : 'National ID'}</span>
              <span className="font-mono text-slate-700">{student.nationalId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'البريد الجامعي' : 'Email'}</span>
              <span className="text-slate-700 font-mono text-[11px]">{student.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'الهاتف' : 'Phone'}</span>
              <span className="text-slate-700 font-mono text-[11px]">{student.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'سنة القيد' : 'Enrolled Year'}</span>
              <span className="text-slate-700">{student.enrolledYear}</span>
            </div>
          </div>

          {/* Attendance Breakdown for This Student */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'متابعة الحضور والغياب بالمقررات' : 'Course Attendance Breakdown'}</span>
              </h4>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${warningTier.colorClass}`}>
                {language === 'ar' ? warningTier.labelAr : warningTier.labelEn}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'كود المقرر' : 'Code'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'اسم المقرر' : 'Course'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الجلسات' : 'Sessions'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'حاضر' : 'Present'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'غائب' : 'Absent'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'نسبة الحضور' : 'Attendance %'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.registeredCourseIds.map((cId) => {
                    const course = courses.find((c) => c.id === cId);
                    const cRecords = studentAttendance.filter((r) => r.courseId === cId);
                    let p = 0; let a = 0; let l = 0; let e = 0;
                    for (const r of cRecords) {
                      if (r.status === 'present') p++;
                      else if (r.status === 'absent') a++;
                      else if (r.status === 'late') l++;
                      else if (r.status === 'excused') e++;
                    }
                    const { attendanceRate: cAttRate, absenceRate: cAbsRate } = calculateAttendancePercentage(
                      p,
                      l,
                      e,
                      cRecords.length
                    );
                    const tier = getAbsenceWarningTier(cAbsRate);

                    return (
                      <tr key={cId} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{course?.code || cId}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{course?.nameAr}</td>
                        <td className="py-2.5 px-3 text-slate-700">{cRecords.length}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{p}</td>
                        <td className="py-2.5 px-3 text-red-600 font-bold">{a}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{cAttRate}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tier.colorClass}`}>
                            {language === 'ar' ? tier.labelAr : tier.labelEn}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Grades Record */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>{language === 'ar' ? 'سجل الدرجات والتقييم الفصلي' : 'Academic Grades & Performance'}</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المقرر' : 'Course'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'أعمال سنة (20)' : 'CW (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'ميدتيرم (20)' : 'Midterm (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'عملي (20)' : 'Lab (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'نهائي (40)' : 'Final (40)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المجموع (100)' : 'Total (100)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'التقدير' : 'Letter'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'النقاط (4.0)' : 'Points'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">
                        {language === 'ar' ? 'لا توجد درجات مرصودة لهذا الطالب حتى الآن' : 'No grades recorded yet'}
                      </td>
                    </tr>
                  ) : (
                    studentGrades.map((g) => {
                      const course = courses.find((c) => c.id === g.courseId);
                      return (
                        <tr key={g.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{course?.code} - {course?.nameAr}</td>
                          <td className="py-2.5 px-3 text-slate-700">{g.courseworkScore}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{g.midtermScore}</td>
                          <td className="py-2.5 px-3 text-slate-700">{g.practicalScore}</td>
                          <td className="py-2.5 px-3 text-slate-700">{g.finalScore}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{g.totalScore}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                g.letterGrade === 'F'
                                  ? 'bg-red-100 text-red-800'
                                  : g.letterGrade.startsWith('A')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-50 text-indigo-800'
                              }`}
                            >
                              {g.letterGrade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{g.gpaPoints.toFixed(1)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (onOpenExpert) onOpenExpert(student.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'فحص كامل بالنظام الخبير' : 'Open in Expert System'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
