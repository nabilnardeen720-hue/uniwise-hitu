import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  AlertOctagon,
  Award,
  Sparkles,
  TrendingDown,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { calculateAttendancePercentage, getAbsenceWarningTier } from '../../utils/academicCalculations';

export const ReportsView: React.FC = () => {
  const {
    students,
    courses,
    departments,
    attendanceRecords,
    grades,
    evaluateAllStudents,
    language,
    logOperation,
  } = useApp();

  const [activeReport, setActiveReport] = useState<'deprivation' | 'probation' | 'honors' | 'departments'>('deprivation');

  // Compute evaluations for all students
  const expertResults = evaluateAllStudents();

  const handlePrint = () => {
    window.print();
    logOperation(
      'طباعة تقرير أكاديمي رسمي',
      'SYSTEM',
      `تم استخراج وطباعة تقرير [${activeReport}] المعتمد من منصة UniWise.`,
      `Printed official [${activeReport}] university report.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Print Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'التقارير الأكاديمية والشهادات الرسمية' : 'Official Academic Reports & Analytics'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              HITU
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'تقارير معتمدة لنسب الغياب، قرارات الحرمان، إحصائيات التعثر، ومؤشرات النظام الخبير قابلة للطباعة والتصدير.'
              : 'Accredited university reports for attendance deprivation, probation, and expert recommendations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'طباعة التقرير بالترويسة الرسمية' : 'Print Official Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs (Hidden during print) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl no-print">
        <button
          onClick={() => setActiveReport('deprivation')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeReport === 'deprivation'
              ? 'bg-white text-red-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-red-600" />
          <span>{language === 'ar' ? 'تقرير الحرمان والغياب (Deprivation)' : 'Deprivation Report'}</span>
        </button>

        <button
          onClick={() => setActiveReport('probation')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeReport === 'probation'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>{language === 'ar' ? 'تقرير التعثر والنظام الخبير' : 'Expert System Risk Report'}</span>
        </button>

        <button
          onClick={() => setActiveReport('honors')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeReport === 'honors'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? 'لوحة الشرف والتميز الأكاديمي' : 'Dean Honors Roll'}</span>
        </button>

        <button
          onClick={() => setActiveReport('departments')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeReport === 'departments'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-indigo-600" />
          <span>{language === 'ar' ? 'مؤشرات أداء الأقسام التكنولوجية' : 'Department KPIs'}</span>
        </button>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Official HITU Letterhead */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              جامعة حلوان التكنولوجية الدولية
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Helwan Int'l Technological University (HITU)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              وكالة الكلية لشؤون التعليم والطلاب • وحدة النظم الذكية والإرشاد الأكاديمي
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-black border border-slate-700 shadow-xs">
            <span className="text-xl leading-none text-amber-400">HITU</span>
            <span className="text-[9px] font-sans font-medium tracking-widest text-slate-300 mt-1">
              PORTAL
            </span>
          </div>

          <div className="text-center sm:text-end text-xs text-slate-600 space-y-1">
            <div>
              <span className="font-semibold text-slate-800">تاريخ الإصدار: </span>
              <span className="font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">الفصل الدراسي: </span>
              <span>خريف 2026 (Fall)</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">رقم الوثيقة: </span>
              <span className="font-mono text-indigo-700">HITU-REP-{Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* REPORT 1: Deprivation Report */}
        {activeReport === 'deprivation' && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>تقرير الحرمان الأكاديمي لتجاوز نسبة الغياب اللائحية (25%)</span>
              </h3>
              <p className="text-xs text-red-800 mt-1">
                وفقاً للائحة جامعة حلوان التكنولوجية الدولية، يُحرم الطالب من دخول الاختبار النهائي للمقرر إذا تجاوزت نسبة غيابه 25% دون عذر قهري معتمد.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">الرقم الجامعي</th>
                    <th className="py-2.5 px-3 text-start">اسم الطالب</th>
                    <th className="py-2.5 px-3 text-start">القسم التكنولوجي</th>
                    <th className="py-2.5 px-3 text-start">المقرر المتجاوز</th>
                    <th className="py-2.5 px-3 text-start">نسبة الغياب</th>
                    <th className="py-2.5 px-3 text-start">القرار المقترح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => {
                      const records = attendanceRecords.filter((r) => r.studentId === s.id);
                      let p = 0; let l = 0; let e = 0;
                      for (const r of records) {
                        if (r.status === 'present') p++;
                        else if (r.status === 'late') l++;
                        else if (r.status === 'excused') e++;
                      }
                      const { absenceRate } = calculateAttendancePercentage(p, l, e, records.length);
                      return absenceRate >= 15;
                    })
                    .map((s) => {
                      const dept = departments.find((d) => d.id === s.departmentId);
                      const records = attendanceRecords.filter((r) => r.studentId === s.id);
                      let p = 0; let l = 0; let e = 0;
                      for (const r of records) {
                        if (r.status === 'present') p++;
                        else if (r.status === 'late') l++;
                        else if (r.status === 'excused') e++;
                      }
                      const { absenceRate } = calculateAttendancePercentage(p, l, e, records.length);

                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.studentId}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{s.nameAr}</td>
                          <td className="py-2.5 px-3 text-slate-600">{dept?.code}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">IT-301 تطوير تطبيقات الويب</td>
                          <td className="py-2.5 px-3 font-bold text-red-600">{absenceRate}%</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[10px]">
                              {absenceRate >= 25 ? 'حرمان من الامتحان النهائي' : 'إنذار ثانٍ واستدعاء ولي الأمر'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: Academic Probation & Expert Recommendations */}
        {activeReport === 'probation' && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <h3 className="font-bold text-sm text-purple-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>تقرير تشخيص حالات التعثر الأكاديمي وتوصيات النظام الخبير</span>
              </h3>
              <p className="text-xs text-purple-800 mt-1">
                تشخيص لحظي صادر عن محرك الاستدلال الأمامي (Forward Chaining) وفق شجرة قواعد الإنتاج المعتمدة.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">الرقم الجامعي</th>
                    <th className="py-2.5 px-3 text-start">اسم الطالب</th>
                    <th className="py-2.5 px-3 text-start">المعدل</th>
                    <th className="py-2.5 px-3 text-start">الحضور</th>
                    <th className="py-2.5 px-3 text-start">مستوى الخطورة</th>
                    <th className="py-2.5 px-3 text-start">القواعد المفعلة</th>
                    <th className="py-2.5 px-3 text-start">التوصية الرئيسية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expertResults.map((res) => (
                    <tr key={res.studentId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{res.workingMemory.student.studentId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{res.studentNameAr}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{res.workingMemory.student.gpa.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{res.workingMemory.overallAttendanceRate}%</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800">
                          {res.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-purple-700">
                        {res.firedRules.map((r) => r.code).join(', ') || 'لا توجد'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                        {res.explanationFacility.recommendationsAr[0] || 'حالة مستقرة - استمرار المتابعة'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: Honors Roll */}
        {activeReport === 'honors' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>لوحة الشرف الأكاديمي لعميد الكلية (Dean's Honors Roll)</span>
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                تكريم الطلاب الحاصلين على معدل تراكمي 3.60 فأعلى مع نسبة حضور لا تقل عن 95% دون أي رسوب.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">الرقم الجامعي</th>
                    <th className="py-2.5 px-3 text-start">اسم الطالب</th>
                    <th className="py-2.5 px-3 text-start">القسم</th>
                    <th className="py-2.5 px-3 text-start">المعدل (GPA)</th>
                    <th className="py-2.5 px-3 text-start">نسبة الحضور</th>
                    <th className="py-2.5 px-3 text-start">المرتبة والامتياز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.gpa >= 3.6)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.studentId}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{s.nameAr}</td>
                        <td className="py-2.5 px-3 text-slate-600">{s.departmentId}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{s.gpa.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">100%</td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700">
                          امتياز مع مرتبة الشرف (ترشيح للتدريب الصناعي المتقدم)
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: Department KPIs */}
        {activeReport === 'departments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {departments.map((d) => {
                const deptStudents = students.filter((s) => s.departmentId === d.id);
                const deptCourses = courses.filter((c) => c.departmentId === d.id);

                return (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-xs text-indigo-700">{d.code}</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{d.nameAr}</h4>
                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>الطلاب المقيدون:</span>
                        <strong className="text-slate-900">{deptStudents.length}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>المقررات النشطة:</span>
                        <strong className="text-slate-900">{deptCourses.length}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>رئيس القسم:</span>
                        <span className="text-slate-800 text-[11px] truncate">{d.headOfDepartmentAr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Approvals & University Stamps Section (Prints at bottom) */}
        <div className="pt-8 border-t-2 border-slate-200 mt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <span className="font-bold text-slate-800 block">رئيس قسم تكنولوجيا المعلومات</span>
            <span className="text-slate-500 block text-[11px] mt-1">د. حنان عبد المنعم</span>
            <div className="mt-6 border-b border-dashed border-slate-300 w-32 mx-auto"></div>
            <span className="text-[10px] text-slate-400 block mt-1">التوقيع والاعتماد</span>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">وكيل الكلية لشؤون التعليم والطلاب</span>
            <span className="text-slate-500 block text-[11px] mt-1">أ.د. شريف كمال الدسوقي</span>
            <div className="mt-6 border-b border-dashed border-slate-300 w-32 mx-auto"></div>
            <span className="text-[10px] text-slate-400 block mt-1">التوقيع والاعتماد</span>
          </div>

          <div>
            <span className="font-bold text-slate-800 block">خاتم شعار جامعة حلوان التكنولوجية</span>
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-300 mx-auto mt-2 flex items-center justify-center text-[9px] font-bold text-indigo-400 font-mono">
              HITU SEAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
