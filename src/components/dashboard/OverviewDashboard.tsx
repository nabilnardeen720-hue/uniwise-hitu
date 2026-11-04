import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarCheck,
  Percent,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface OverviewDashboardProps {
  onOpenTakeAttendance?: () => void;
  onSelectStudentForExpert?: (studentId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onOpenTakeAttendance,
  onSelectStudentForExpert,
}) => {
  const {
    currentUser,
    students,
    courses,
    sessions,
    attendanceRecords,
    productionRules,
    setActiveTab,
    language,
    isProductionCleanMode,
  } = useApp();

  const isRTL = language === 'ar';

  // Calculate high-level metrics
  const totalStudents = students.length;
  const totalSessions = sessions.length;

  const totalAttendanceEntries = attendanceRecords.length;
  const presentOrLateEntries = attendanceRecords.filter(
    (r) => r.status === 'present' || r.status === 'late'
  ).length;

  const avgAttendance =
    totalAttendanceEntries > 0
      ? Math.round((presentOrLateEntries / totalAttendanceEntries) * 100)
      : 100;

  const criticalCount = students.filter(
    (s) => s.status === 'deprivation_risk' || s.status === 'academic_probation'
  ).length;

  const warningCount = students.filter(
    (s) => s.status === 'attendance_warning' || s.status === 'early_warning' || s.status === 'needs_review'
  ).length;

  const honorsCount = students.filter((s) => s.status === 'honors').length;

  return (
    <div className="space-y-6">
      {/* Welcome & University Identity Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/50 text-indigo-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>جامعة حلوان التكنولوجية الدولية (HITU)</span>
              <span>•</span>
              <span>Helwan Int'l Technological University</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{language === 'ar' ? `مرحباً، ${currentUser.nameAr}` : `Welcome, ${currentUser.nameEn}`}</span>
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'المنصة الجامعية الموحدة لدمج نظام الحضور والغياب الذكي مع النظام الخبير الاستدلالي لمتابعة الأداء والتعثر الأكاديمي للطلاب لحظياً.'
                : 'Unified university platform integrating smart attendance tracking with an inference-driven academic expert system.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('expert-system')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ar' ? 'تشغيل النظام الخبير' : 'Run Expert System'}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenTakeAttendance) onOpenTakeAttendance();
                else setActiveTab('attendance');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all backdrop-blur-xs"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>{language === 'ar' ? 'تسجيل حضور جديد' : 'Take Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background pattern */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'إجمالي الطلاب المقيدين' : 'Enrolled Students'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'طالب' : 'students'}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{honorsCount}</span>
            <span>{language === 'ar' ? 'في لوحة الشرف' : 'on honors roll'}</span>
          </div>
        </div>

        {/* Total Lecture Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'المحاضرات المنعقدة' : 'Sessions Recorded'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalSessions}</span>
            <span className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'محاضرة' : 'sessions'}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-indigo-600 font-semibold">{courses.length}</span>
            <span>{language === 'ar' ? 'مقررات تكنولوجية نشطة' : 'active courses'}</span>
          </div>
        </div>

        {/* Average Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'متوسط نسبة الحضور' : 'Average Attendance'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgAttendance}%</span>
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                avgAttendance >= 85
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {avgAttendance >= 85 ? (language === 'ar' ? 'مستقر' : 'Stable') : (language === 'ar' ? 'تحت المتابعة' : 'Watch')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {language === 'ar' ? 'الحد الأدنى اللائحي: 75%' : 'Minimum bylaw: 75%'}
          </div>
        </div>

        {/* Critical Deprivation Risk Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-red-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'خطر الحرمان والتعثر' : 'Deprivation Alerts'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{criticalCount}</span>
            <span className="text-xs text-amber-600 font-semibold">
              (+{warningCount} {language === 'ar' ? 'إنذار' : 'warnings'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-700/80 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تستوجب تدخلاً إرشادياً' : 'Requires advisor action'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Students at Risk & Quick Attendance Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center 2 Cols: Academic Risk & Expert System Spotlight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>
                  {language === 'ar'
                    ? 'رصد الحالات الأكاديمية ونظام الاستدلال'
                    : 'Academic Risk Spotlight & Inference Monitor'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'الربط التلقائي بين سجلات الغياب والدرجات لتحليل التعثر'
                  : 'Automated correlation between attendance records and grade vulnerability'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('expert-system')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'فتح المحرك كاملاً' : 'Full Studio'}</span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Student Status List */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الطالب' : 'Student'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'HITU ID'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المعدل' : 'GPA'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'تشخيص النظام الخبير' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'إجراء فوري' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const isCritical =
                    student.status === 'deprivation_risk' ||
                    student.status === 'academic_probation';
                  const isWarning =
                    student.status === 'attendance_warning' ||
                    student.status === 'early_warning';
                  const isHonors = student.status === 'honors';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {language === 'ar' ? student.nameAr : student.nameEn}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {student.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold border border-red-200">
                            <AlertOctagon className="w-3 h-3" />
                            {student.status === 'deprivation_risk'
                              ? language === 'ar'
                                ? 'خطر حرمان (غياب > 25%)'
                                : 'Deprivation Risk'
                              : language === 'ar'
                              ? 'إنذار أكاديمي (GPA < 2.0)'
                              : 'Probation'}
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {language === 'ar' ? 'إنذار غياب مبكر' : 'Early Warning'}
                          </span>
                        )}
                        {isHonors && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'ar' ? 'لوحة الشرف' : 'Honors Roll'}
                          </span>
                        )}
                        {student.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {language === 'ar' ? 'نشط - منتظم' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            if (onSelectStudentForExpert) {
                              onSelectStudentForExpert(student.id);
                            }
                            setActiveTab('expert-system');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-[11px] transition-colors"
                        >
                          {language === 'ar' ? 'تحليل وتعليل' : 'Analyze'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Attendance Hub & Bylaw Reference */}
        <div className="space-y-6">
          {/* Quick Attendance Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ar' ? 'تسجيل ومتابعة الغياب' : 'Attendance Hub'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {language === 'ar'
                ? 'النظام المدمج لحصر الحضور اليومي للمحاضرات والمعامل التكنولوجية.'
                : 'Integrated tool for taking lecture and lab attendance sessions.'}
            </p>

            <button
              onClick={() => {
                if (onOpenTakeAttendance) onOpenTakeAttendance();
                else setActiveTab('attendance');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>
                {language === 'ar' ? 'بدء جلسة تحضير جديدة' : 'Start Session'}
              </span>
            </button>

            {/* Threshold Guide */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-700">
                {language === 'ar'
                  ? 'حدود الغياب اللائحية (HITU):'
                  : 'Absence Bylaw Limits (HITU):'}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="font-bold">&lt; 10%:</span> {language === 'ar' ? 'آمن ومستقر' : 'Safe'}
                </div>
                <div className="p-1.5 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
                  <span className="font-bold">10%:</span> {language === 'ar' ? 'إنذار أول' : '1st Warn'}
                </div>
                <div className="p-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                  <span className="font-bold">15%:</span> {language === 'ar' ? 'إنذار ثانٍ' : '2nd Warn'}
                </div>
                <div className="p-1.5 rounded-md bg-red-50 border border-red-200 text-red-800 font-bold">
                  <span>&gt;= 25%:</span> {language === 'ar' ? 'حرمان نهائي' : 'Deprived'}
                </div>
              </div>
            </div>
          </div>

          {/* Handover & Presentation Card */}
          <div className="rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span>
                {language === 'ar'
                  ? 'جاهزية العرض أمام الدكتور'
                  : 'Doctor Handover Ready'}
              </span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {language === 'ar'
                ? 'تم تجهيز سيناريو عرض كامل من 13 خطوة مع 6 وثائق تسليم باللغة العربية تشمل معمارية النظام وقواعد البيانات.'
                : '13-step demonstration scenario ready with complete handover architectural guides.'}
            </p>
            <button
              onClick={() => setActiveTab('handover')}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>{language === 'ar' ? 'فتح سيناريو العرض' : 'Open Demo Guide'}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
