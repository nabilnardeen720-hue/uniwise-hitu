import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  X,
  CalendarCheck,
  Check,
  UserX,
  Clock,
  FileCheck,
  CheckCheck,
  Save,
  AlertCircle,
} from 'lucide-react';

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourseId?: string;
}

export const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({
  isOpen,
  onClose,
  preselectedCourseId,
}) => {
  const { courses, students, currentUser, recordAttendanceSession, language } = useApp();

  const [courseId, setCourseId] = useState<string>(
    preselectedCourseId || courses[0]?.id || ''
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weekNumber, setWeekNumber] = useState<number>(5);
  const [hall, setHall] = useState<string>('مدرج د/ إبراهيم بدر - مبنى أ');
  const [timeSlot, setTimeSlot] = useState<string>('09:00 - 11:00');
  const [topicAr, setTopicAr] = useState<string>('تطبيقات النظم الخبيرة والذكاء الاصطناعي في إدارة الجامعات التكنولوجية');
  const [topicEn, setTopicEn] = useState<string>('Applied Expert Systems in Technological Universities');

  // Enrolled students for selected course
  const enrolledStudents = students.filter(
    (s) => s.registeredCourseIds.includes(courseId)
  );

  // Attendance state map: studentId -> { status, notes }
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    for (const s of enrolledStudents) {
      initial[s.id] = { status: 'present', notes: '' };
    }
    return initial;
  });

  if (!isOpen) return null;

  const setAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    for (const s of enrolledStudents) {
      updated[s.id] = {
        status,
        notes: attendanceMap[s.id]?.notes || '',
      };
    }
    setAttendanceMap(updated);
  };

  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        notes: prev[studentId]?.notes || '',
      },
    }));
  };

  const handleStudentNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'present',
        notes,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const records = enrolledStudents.map((s) => ({
      studentId: s.id,
      status: attendanceMap[s.id]?.status || 'present',
      notes: attendanceMap[s.id]?.notes || '',
    }));

    recordAttendanceSession(
      {
        courseId,
        doctorId: currentUser.id,
        date,
        timeSlot,
        hall,
        weekNumber,
        topicAr,
        topicEn,
      },
      records
    );

    onClose();
  };

  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-linear-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {language === 'ar'
                  ? 'تسجيل حضور وغياب محاضرة تكنولوجية'
                  : 'Take Lecture Attendance'}
              </h3>
              <p className="text-xs text-indigo-200">
                جامعة حلوان التكنولوجية الدولية (HITU) – نظام الحضور المدمج
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Session Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'المقرر الدراسي' : 'Course'}
                </label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setCourseId(newId);
                    const newEnrolled = students.filter((s) =>
                      s.registeredCourseIds.includes(newId)
                    );
                    const newMap: Record<string, { status: AttendanceStatus; notes: string }> = {};
                    for (const s of newEnrolled) {
                      newMap[s.id] = { status: 'present', notes: '' };
                    }
                    setAttendanceMap(newMap);
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'تاريخ المحاضرة' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الأسبوع الدراسي' : 'Week Number'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'المدرج / المعمل' : 'Hall / Lab'}
                </label>
                <input
                  type="text"
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'الفترة الزمنية' : 'Time Slot'}
                </label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'موضوع المحاضرة' : 'Lecture Topic'}
                </label>
                <input
                  type="text"
                  value={topicAr}
                  onChange={(e) => setTopicAr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Student Roster Section */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">
                    {language === 'ar'
                      ? `قائمة الطلاب المسجلين (${enrolledStudents.length} طلاب)`
                      : `Enrolled Students (${enrolledStudents.length})`}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {selectedCourse?.code}
                  </span>
                </div>

                {/* Quick Toggle Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllStatus('present')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تحضير الكل حاضر' : 'All Present'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllStatus('absent')}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'الكل غائب' : 'All Absent'}</span>
                  </button>
                </div>
              </div>

              {enrolledStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">
                    {language === 'ar'
                      ? 'لا يوجد طلاب مسجلين في هذا المقرر حالياً.'
                      : 'No students enrolled in this course.'}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {enrolledStudents.map((student) => {
                    const currentStatus = attendanceMap[student.id]?.status || 'present';
                    const currentNotes = attendanceMap[student.id]?.notes || '';

                    return (
                      <div
                        key={student.id}
                        className="p-3 bg-white hover:bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {student.nameAr.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-slate-900">
                              {language === 'ar' ? student.nameAr : student.nameEn}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                              <span>{student.studentId}</span>
                              <span>•</span>
                              <span>{language === 'ar' ? 'المستوى' : 'Level'} {student.academicLevel}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'حاضر' : 'Present'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'غائب' : 'Absent'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'late')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'متأخر' : 'Late'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'excused')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'عذر' : 'Excused'}</span>
                          </button>

                          <input
                            type="text"
                            placeholder={language === 'ar' ? 'ملاحظة (اختياري)...' : 'Note...'}
                            value={currentNotes}
                            onChange={(e) => handleStudentNotesChange(student.id, e.target.value)}
                            className="text-[11px] rounded-lg border border-slate-200 px-2 py-1 w-28 sm:w-36 text-slate-700 bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {language === 'ar'
                ? 'سيتم تحديث سجلات الحضور وتغذية النظام الخبير تلقائياً.'
                : 'Records will update and feed the expert system automatically.'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={enrolledStudents.length === 0}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'حفظ واعتماد الجلسة' : 'Save Attendance Session'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
