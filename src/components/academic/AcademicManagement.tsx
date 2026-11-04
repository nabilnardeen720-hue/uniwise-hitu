import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Award,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Department, Course, GradeRecord } from '../../types';
import { calculateGradePoints } from '../../utils/academicCalculations';

export const AcademicManagement: React.FC = () => {
  const {
    departments,
    courses,
    doctors,
    students,
    grades,
    saveGrade,
    addCourse,
    addDepartment,
    language,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'grades' | 'courses' | 'departments'>('grades');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  // Grade entry state: studentId -> { coursework, midterm, practical, final }
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledStudents = students.filter((s) => s.registeredCourseIds.includes(selectedCourseId));

  const [gradeInputs, setGradeInputs] = useState<
    Record<
      string,
      { coursework: number; midterm: number; practical: number; final: number }
    >
  >(() => {
    const map: Record<
      string,
      { coursework: number; midterm: number; practical: number; final: number }
    > = {};
    for (const s of enrolledStudents) {
      const existing = grades.find((g) => g.studentId === s.id && g.courseId === selectedCourseId);
      map[s.id] = {
        coursework: existing?.courseworkScore || 15,
        midterm: existing?.midtermScore || 15,
        practical: existing?.practicalScore || 15,
        final: existing?.finalScore || 30,
      };
    }
    return map;
  });

  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('IT-304');
  const [newCourseNameAr, setNewCourseNameAr] = useState('');
  const [newCourseNameEn, setNewCourseNameEn] = useState('');
  const [newCourseDept, setNewCourseDept] = useState(departments[0]?.id || '');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseDoctor, setNewCourseDoctor] = useState(doctors[0]?.id || '');

  const handleScoreChange = (
    studentId: string,
    field: 'coursework' | 'midterm' | 'practical' | 'final',
    val: number
  ) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { coursework: 0, midterm: 0, practical: 0, final: 0 }),
        [field]: Number(val),
      },
    }));
  };

  const handleSaveAllGrades = () => {
    for (const s of enrolledStudents) {
      const input = gradeInputs[s.id] || { coursework: 15, midterm: 15, practical: 15, final: 30 };
      saveGrade(
        s.id,
        selectedCourseId,
        input.coursework,
        input.midterm,
        input.practical,
        input.final,
        'Fall 2026'
      );
    }
    alert(language === 'ar' ? 'تم حفظ واعتماد الدرجات بنجاح في قاعدة البيانات!' : 'Grades saved successfully!');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseNameAr.trim()) return;

    addCourse({
      code: newCourseCode.trim(),
      nameAr: newCourseNameAr.trim(),
      nameEn: newCourseNameEn.trim() || newCourseNameAr.trim(),
      departmentId: newCourseDept,
      creditHours: newCourseCredits,
      semester: 5,
      doctorId: newCourseDoctor,
      maxAbsencePercent: 25,
      lectureHall: 'قاعة 201 - مبنى التكنولوجيا',
      timeSlot: '10:00 - 12:00',
      dayOfWeek: 'الثلاثاء',
    });

    setIsAddCourseOpen(false);
    setNewCourseNameAr('');
    setNewCourseNameEn('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'الإدارة الأكاديمية والدرجات' : 'Academic & Grading Management'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              HITU
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'إدارة الأقسام التكنولوجية، المقررات، ورصد درجات أعمال السنة والامتحانات وتحديث المعدلات التراكمية.'
              : 'Manage departments, course curriculum, and submit official grade assessments.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'grades'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'رصد الدرجات' : 'Grade Entry'}
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'courses'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'المقررات' : 'Courses'}
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'departments'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'الأقسام' : 'Departments'}
          </button>
        </div>
      </div>

      {/* TAB 1: GRADE ENTRY MATRIX */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ar' ? 'اختر المقرر الدراسي لرصد الدرجات:' : 'Select Course to Enter Grades:'}
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const enrolled = students.filter((s) => s.registeredCourseIds.includes(e.target.value));
                  const map: Record<string, any> = {};
                  for (const s of enrolled) {
                    const existing = grades.find((g) => g.studentId === s.id && g.courseId === e.target.value);
                    map[s.id] = {
                      coursework: existing?.courseworkScore || 15,
                      midterm: existing?.midtermScore || 15,
                      practical: existing?.practicalScore || 15,
                      final: existing?.finalScore || 30,
                    };
                  }
                  setGradeInputs(map);
                }}
                className="text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-slate-50 text-slate-800"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveAllGrades}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ واعتماد الدرجات' : 'Save & Submit Grades'}</span>
            </button>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                {language === 'ar'
                  ? `قائمة الطلاب المسجلين بمقرر [${selectedCourse?.code} - ${selectedCourse?.nameAr}] (${enrolledStudents.length} طلاب)`
                  : `Enrolled Students in [${selectedCourse?.code}] (${enrolledStudents.length})`}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'نظام الساعات المعتمدة (100 درجة)' : 'Credit-hour grading (100 scale)'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'ID'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'اسم الطالب' : 'Name'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'أعمال سنة (20)' : 'CW (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'ميدتيرم (20)' : 'Midterm (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'عملي (20)' : 'Lab (20)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'نهائي (40)' : 'Final (40)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المجموع (100)' : 'Total (100)'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'التقدير' : 'Grade'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'النقاط' : 'Points'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledStudents.map((s) => {
                    const currentInput = gradeInputs[s.id] || { coursework: 15, midterm: 15, practical: 15, final: 30 };
                    const total =
                      Number(currentInput.coursework) +
                      Number(currentInput.midterm) +
                      Number(currentInput.practical) +
                      Number(currentInput.final);
                    const { letterGrade, gpaPoints } = calculateGradePoints(total);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.studentId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.nameAr}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={currentInput.coursework}
                            onChange={(e) => handleScoreChange(s.id, 'coursework', Number(e.target.value))}
                            className="w-16 p-1 text-center font-bold border border-slate-300 rounded-md bg-white text-slate-800"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={currentInput.midterm}
                            onChange={(e) => handleScoreChange(s.id, 'midterm', Number(e.target.value))}
                            className={`w-16 p-1 text-center font-bold border rounded-md bg-white ${
                              currentInput.midterm < 10 ? 'border-red-400 text-red-600 bg-red-50' : 'border-slate-300 text-slate-800'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={currentInput.practical}
                            onChange={(e) => handleScoreChange(s.id, 'practical', Number(e.target.value))}
                            className="w-16 p-1 text-center font-bold border border-slate-300 rounded-md bg-white text-slate-800"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={currentInput.final}
                            onChange={(e) => handleScoreChange(s.id, 'final', Number(e.target.value))}
                            className="w-16 p-1 text-center font-bold border border-slate-300 rounded-md bg-white text-slate-800"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-sm text-indigo-700">
                          {total}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              letterGrade === 'F'
                                ? 'bg-red-100 text-red-800'
                                : letterGrade.startsWith('A')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-50 text-indigo-800'
                            }`}
                          >
                            {letterGrade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{gpaPoints.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE CATALOG */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              {language === 'ar' ? 'دليل المقررات التكنولوجية المعتمدة' : 'Accredited Course Catalog'}
            </h3>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsAddCourseOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إضافة مقرر جديد' : 'Add Course'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const dept = departments.find((d) => d.id === course.departmentId);
              const doctor = doctors.find((d) => d.id === course.doctorId);
              const enrolledCount = students.filter((s) => s.registeredCourseIds.includes(course.id)).length;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {course.creditHours} {language === 'ar' ? 'ساعات معتمدة' : 'Credits'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{course.nameAr}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{course.nameEn}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ar' ? 'القسم:' : 'Dept:'}</span>
                      <span className="font-medium">{dept?.code} - {dept?.nameAr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ar' ? 'أستاذ المادة:' : 'Instructor:'}</span>
                      <span className="font-medium text-slate-800">{doctor?.nameAr || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ar' ? 'الطلاب المسجلون:' : 'Enrolled:'}</span>
                      <span className="font-bold text-indigo-700">{enrolledCount} {language === 'ar' ? 'طالب' : 'students'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ar' ? 'المدرج والوقت:' : 'Hall & Time:'}</span>
                      <span className="font-medium text-slate-700">{course.dayOfWeek} ({course.timeSlot})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              {language === 'ar' ? 'أقسام جامعة حلوان التكنولوجية الدولية (HITU)' : 'HITU Academic Departments'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const deptCourses = courses.filter((c) => c.departmentId === dept.id);
              const deptStudents = students.filter((s) => s.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {dept.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{dept.nameAr}</h4>
                        <span className="text-xs text-slate-400">{dept.nameEn}</span>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      تأسس {dept.establishedYear}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{dept.descriptionAr}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {language === 'ar' ? 'رئيس القسم:' : 'Head of Dept:'}{' '}
                      <strong className="text-slate-800">{dept.headOfDepartmentAr}</strong>
                    </span>
                    <span className="font-bold text-indigo-700">
                      {deptStudents.length} {language === 'ar' ? 'طالب مقيد' : 'students'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">
                {language === 'ar' ? 'إضافة مقرر تكنولوجي جديد' : 'Add New Course'}
              </h3>
              <button onClick={() => setIsAddCourseOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{language === 'ar' ? 'كود المقرر' : 'Code'} *</label>
                <input
                  type="text"
                  required
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'ar' ? 'اسم المقرر بالعربية' : 'Arabic Name'} *</label>
                <input
                  type="text"
                  required
                  value={newCourseNameAr}
                  onChange={(e) => setNewCourseNameAr(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'ar' ? 'القسم التكنولوجي' : 'Department'} *</label>
                <select
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code} - {d.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">{language === 'ar' ? 'أستاذ المادة' : 'Doctor'} *</label>
                <select
                  value={newCourseDoctor}
                  onChange={(e) => setNewCourseDoctor(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.nameAr}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg"
                >
                  {language === 'ar' ? 'حفظ المقرر' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
