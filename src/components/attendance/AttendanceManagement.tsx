import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  UserX,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  Info,
} from 'lucide-react';
import { calculateAttendancePercentage, getAbsenceWarningTier } from '../../utils/academicCalculations';
import { AttendanceStatus } from '../../types';

interface AttendanceManagementProps {
  onOpenTakeAttendance: (courseId?: string) => void;
  onSelectStudentForExpert?: (studentId: string) => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  onOpenTakeAttendance,
  onSelectStudentForExpert,
}) => {
  const {
    courses,
    students,
    departments,
    sessions,
    attendanceRecords,
    setActiveTab,
    language,
    currentUser,
    logOperation,
  } = useApp();

  const isRTL = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'sessions' | 'records'>('roster');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<string | null>(null);

  // Filter students based on selection
  const filteredStudents = students.filter((student) => {
    const matchesDept = selectedDepartmentId === 'all' || student.departmentId === selectedDepartmentId;
    const matchesCourse = selectedCourseId === 'all' || student.registeredCourseIds.includes(selectedCourseId);
    const matchesSearch =
      student.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery);

    return matchesDept && matchesCourse && matchesSearch;
  });

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const course = courses.find((c) => c.id === session.courseId);
    const matchesDept = selectedDepartmentId === 'all' || course?.departmentId === selectedDepartmentId;
    const matchesCourse = selectedCourseId === 'all' || session.courseId === selectedCourseId;
    return matchesDept && matchesCourse;
  });

  // Filter granular records
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesCourse = selectedCourseId === 'all' || rec.courseId === selectedCourseId;
    const student = students.find((s) => s.id === rec.studentId);
    const matchesSearch =
      !searchQuery ||
      (student && (
        student.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.includes(searchQuery)
      ));
    return matchesCourse && matchesSearch;
  });

  // Calculate statistics for header cards
  const totalSessionsCount = sessions.length;
  let totalPresentCount = 0;
  let totalAbsentCount = 0;
  let totalLateCount = 0;

  for (const r of attendanceRecords) {
    if (r.status === 'present') totalPresentCount++;
    else if (r.status === 'absent') totalAbsentCount++;
    else if (r.status === 'late') totalLateCount++;
  }

  const overallTotal = attendanceRecords.length;
  const overallAttRate = overallTotal > 0
    ? Math.round(((totalPresentCount + totalLateCount * 0.5) / overallTotal) * 100)
    : 100;

  // Export attendance roster as CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const header = ['الرقم الجامعي', 'اسم الطالب', 'القسم', 'المقرر', 'إجمالي المحاضرات', 'حاضر', 'غائب', 'متأخر', 'نسبة الحضور', 'نسبة الغياب', 'الحالة اللائحية'];
    const rows = filteredStudents.map((s) => {
      const studentRecords = attendanceRecords.filter((r) => r.studentId === s.id && (selectedCourseId === 'all' || r.courseId === selectedCourseId));
      let p = 0; let a = 0; let l = 0; let e = 0;
      for (const r of studentRecords) {
        if (r.status === 'present') p++;
        else if (r.status === 'absent') a++;
        else if (r.status === 'late') l++;
        else if (r.status === 'excused') e++;
      }
      const { attendanceRate, absenceRate } = calculateAttendancePercentage(p, l, e, studentRecords.length);
      const tier = getAbsenceWarningTier(absenceRate);
      const dept = departments.find((d) => d.id === s.departmentId);

      return [
        s.studentId,
        s.nameAr,
        dept?.nameAr || '',
        selectedCourseId === 'all' ? 'جميع المقررات' : (courses.find((c) => c.id === selectedCourseId)?.code || ''),
        studentRecords.length,
        p,
        a,
        l,
        `${attendanceRate}%`,
        `${absenceRate}%`,
        tier.labelAr,
      ];
    });

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HITU_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logOperation(
      'تصدير تقرير الغياب والحضور',
      'ATTENDANCE',
      `تم تصدير تقرير الحضور والغياب بصيغة CSV لعدد (${filteredStudents.length}) طالب.`,
      `Exported attendance CSV report for (${filteredStudents.length}) students.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar'
                ? 'نظام متابعة وتسجيل الحضور والغياب'
                : 'Attendance & Absence Management System'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {language === 'ar' ? 'مدمج في UniWise' : 'Integrated'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'إدارة جلسات المحاضرات والمعامل، واحتساب نسب الحضور، والربط اللحظي بقواعد الحرمان والنظام الخبير.'
              : 'Record lecture attendance, compute absence rates, and feed real-time expert system risk analysis.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ar' ? 'تصدير Excel / CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => onOpenTakeAttendance(selectedCourseId !== 'all' ? selectedCourseId : undefined)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل حضور محاضرة' : 'Take Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {language === 'ar' ? 'جلسات المحاضرات المسجلة' : 'Recorded Sessions'}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalSessionsCount}</span>
            <span className="text-[11px] text-slate-400">{language === 'ar' ? 'جلسة' : 'sessions'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {language === 'ar' ? 'متوسط نسبة الحضور العام' : 'Overall Attendance'}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallAttRate}%</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{language === 'ar' ? 'لائحي' : 'Bylaw'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {language === 'ar' ? 'مرات تسجيل الغياب' : 'Total Absences'}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{totalAbsentCount}</span>
            <span className="text-[11px] text-slate-400">{language === 'ar' ? 'حالة غياب' : 'absent marks'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {language === 'ar' ? 'الطلاب تحت طائلة الإنذار' : 'At-Risk Students'}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {students.filter((s) => s.status === 'deprivation_risk' || s.status === 'attendance_warning').length}
            </span>
            <span className="text-[11px] text-red-600 font-semibold">
              {language === 'ar' ? 'تجاوزوا 15%' : '> 15%'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Department Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">{language === 'ar' ? 'جميع الأقسام' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">{language === 'ar' ? 'جميع المقررات الدراسية' : 'All Courses'}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-2.5 ${isRTL ? 'right-2.5' : 'left-2.5'}`} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث بالاسم أو الرقم الجامعي...' : 'Search student or ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-lg border border-slate-200 py-2 ${
                isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
              } bg-slate-50 text-slate-800 placeholder-slate-400`}
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'roster'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'متابعة غياب الطلاب' : 'Student Roster'}
          </button>

          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'sessions'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'جلسات المحاضرات' : 'Sessions'}
          </button>

          <button
            onClick={() => setActiveSubTab('records')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'records'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'السجل التفصيلي' : 'All Logs'}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Student Roster & Absence Rates */}
      {activeSubTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              {language === 'ar'
                ? `نسب الحضور والغياب للطلاب (${filteredStudents.length} طالب)`
                : `Student Attendance Records (${filteredStudents.length})`}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'ar'
                ? 'البيانات مربوطة مباشرة بالنظام الخبير للاستدلال والتعليل'
                : 'Directly linked to Expert Inference Engine'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'اسم الطالب' : 'Name'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'القسم التكنولوجي' : 'Department'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'الجلسات المسجلة' : 'Sessions'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'حاضر / غائب / متأخر' : 'P / A / L'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'نسبة الحضور' : 'Att %'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'نسبة الغياب' : 'Abs %'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'الحالة اللائحية' : 'Bylaw Status'}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'التكامل الخبير' : 'Expert Link'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      {language === 'ar' ? 'لا توجد سجلات تطابق الفلاتر المحددة' : 'No records match filter'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    // Filter attendance records for this student and selected course
                    const studentRecords = attendanceRecords.filter(
                      (r) =>
                        r.studentId === student.id &&
                        (selectedCourseId === 'all' || r.courseId === selectedCourseId)
                    );

                    let p = 0; let a = 0; let l = 0; let e = 0;
                    for (const r of studentRecords) {
                      if (r.status === 'present') p++;
                      else if (r.status === 'absent') a++;
                      else if (r.status === 'late') l++;
                      else if (r.status === 'excused') e++;
                    }

                    const { attendanceRate, absenceRate } = calculateAttendancePercentage(
                      p,
                      l,
                      e,
                      studentRecords.length
                    );
                    const warningTier = getAbsenceWarningTier(absenceRate);
                    const dept = departments.find((d) => d.id === student.departmentId);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {student.studentId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {language === 'ar' ? student.nameAr : student.nameEn}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {dept?.code || student.departmentId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {studentRecords.length}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-semibold">{p}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-red-600 font-semibold">{a}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-amber-600 font-semibold">{l}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{attendanceRate}%</span>
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  attendanceRate >= 85
                                    ? 'bg-emerald-500'
                                    : attendanceRate >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              absenceRate >= 25
                                ? 'text-red-600'
                                : absenceRate >= 15
                                ? 'text-amber-600'
                                : absenceRate >= 10
                                ? 'text-yellow-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {absenceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] border ${warningTier.colorClass}`}
                          >
                            {warningTier.tier === 'deprivation' && <AlertOctagon className="w-3 h-3" />}
                            {warningTier.tier === 'warning_2' && <AlertTriangle className="w-3 h-3" />}
                            {warningTier.tier === 'warning_1' && <Clock className="w-3 h-3" />}
                            {warningTier.tier === 'safe' && <CheckCircle2 className="w-3 h-3" />}
                            <span>{language === 'ar' ? warningTier.labelAr : warningTier.labelEn}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              if (onSelectStudentForExpert) {
                                onSelectStudentForExpert(student.id);
                              }
                              setActiveTab('expert-system');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-purple-200"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>{language === 'ar' ? 'استدلال خبير' : 'Expert Trace'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Recorded Lecture Sessions */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => {
              const course = courses.find((c) => c.id === session.courseId);
              const presentPct =
                session.totalEnrolled > 0
                  ? Math.round((session.presentCount / session.totalEnrolled) * 100)
                  : 0;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {course?.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {course?.nameAr}
                      </h4>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {language === 'ar' ? `الأسبوع ${session.weekNumber}` : `Week ${session.weekNumber}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">
                    {language === 'ar' ? session.topicAr : session.topicEn}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{language === 'ar' ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                      <span className="font-medium text-slate-700">{session.date} ({session.timeSlot})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{language === 'ar' ? 'المدرج / المعمل:' : 'Hall:'}</span>
                      <span className="font-medium text-slate-700">{session.hall}</span>
                    </div>
                  </div>

                  {/* Attendance Stats Bar */}
                  <div className="mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">
                        {language === 'ar' ? 'نسبة الحضور:' : 'Attendance Rate:'}
                      </span>
                      <span className="font-bold text-slate-900">{presentPct}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(session.presentCount / session.totalEnrolled) * 100}%` }}
                      />
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${(session.absentCount / session.totalEnrolled) * 100}%` }}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(session.lateCount / session.totalEnrolled) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                      <span className="text-emerald-700 font-semibold">
                        {language === 'ar' ? 'حاضر' : 'Present'}: {session.presentCount}
                      </span>
                      <span className="text-red-600 font-semibold">
                        {language === 'ar' ? 'غائب' : 'Absent'}: {session.absentCount}
                      </span>
                      <span className="text-amber-700 font-semibold">
                        {language === 'ar' ? 'متأخر' : 'Late'}: {session.lateCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Detailed Granular Attendance Records */}
      {activeSubTab === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-800">
              {language === 'ar'
                ? `سجل الحضور الفردي (${filteredRecords.length} قيد)`
                : `Individual Attendance Logs (${filteredRecords.length})`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'المقرر' : 'Course'}</th>
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الطالب' : 'Student'}</th>
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'ID'}</th>
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const student = students.find((s) => s.id === rec.studentId);
                  const course = courses.find((c) => c.id === rec.courseId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-600">{rec.date}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{course?.code}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{student?.nameAr}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{student?.studentId}</td>
                      <td className="py-2.5 px-4">
                        {rec.status === 'present' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                            {language === 'ar' ? 'حاضر' : 'Present'}
                          </span>
                        )}
                        {rec.status === 'absent' && (
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold">
                            {language === 'ar' ? 'غائب' : 'Absent'}
                          </span>
                        )}
                        {rec.status === 'late' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                            {language === 'ar' ? 'متأخر' : 'Late'}
                          </span>
                        )}
                        {rec.status === 'excused' && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                            {language === 'ar' ? 'معذور' : 'Excused'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {rec.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
