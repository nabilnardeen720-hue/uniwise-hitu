import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  GraduationCap,
  X,
  Save,
} from 'lucide-react';
import { Student, StudentStatus } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { calculateAttendancePercentage, getAbsenceWarningTier } from '../../utils/academicCalculations';

interface StudentManagementProps {
  onSelectStudentForExpert?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onSelectStudentForExpert,
}) => {
  const {
    students,
    departments,
    courses,
    attendanceRecords,
    addStudent,
    deleteStudent,
    setActiveTab,
    language,
    currentUser,
  } = useApp();

  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Student Form State
  const [newStudentId, setNewStudentId] = useState<string>('202410106');
  const [newNameAr, setNewNameAr] = useState<string>('');
  const [newNameEn, setNewNameEn] = useState<string>('');
  const [newNationalId, setNewNationalId] = useState<string>('30405100109988');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('01099887766');
  const [newDeptId, setNewDeptId] = useState<string>(departments[0]?.id || '');
  const [newLevel, setNewLevel] = useState<number>(1);
  const [newGpa, setNewGpa] = useState<number>(3.0);
  const [newRegisteredCourses, setNewRegisteredCourses] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesDept = selectedDeptId === 'all' || s.departmentId === selectedDeptId;
    const matchesLevel = selectedLevel === 'all' || s.academicLevel === Number(selectedLevel);
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesSearch =
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.includes(searchQuery);

    return matchesDept && matchesLevel && matchesStatus && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim() || !newStudentId.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال اسم الطالب والرقم الجامعي' : 'Name and ID are required');
      return;
    }

    if (students.some((s) => s.studentId === newStudentId.trim())) {
      setFormError(language === 'ar' ? 'الرقم الجامعي مستخدم بالفعل لطالب آخر' : 'Student ID already exists');
      return;
    }

    addStudent({
      studentId: newStudentId.trim(),
      nationalId: newNationalId.trim(),
      nameAr: newNameAr.trim(),
      nameEn: newNameEn.trim() || newNameAr.trim(),
      email: newEmail.trim() || `${newStudentId.trim()}@hitu.edu.eg`,
      phone: newPhone.trim(),
      departmentId: newDeptId,
      academicLevel: newLevel,
      gpa: Number(newGpa) || 3.0,
      registeredCourseIds: newRegisteredCourses.length > 0 ? newRegisteredCourses : [courses[0]?.id || ''],
      status: 'active',
      advisorId: 'doc-1',
      enrolledYear: 2024,
    });

    setIsAddModalOpen(false);
    setNewNameAr('');
    setNewNameEn('');
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'إدارة شؤون وملفات الطلاب' : 'Student Affairs & Directory'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              HITU
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'السجلات الأكاديمية الرسمية، الأرقام الجامعية، نسب الحضور، والربط بالنظام الخبير.'
              : 'Official university student records, attendance rates, and expert system linkages.'}
          </p>
        </div>

        {currentUser.role !== 'student' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة طالب جديد' : 'Add New Student'}</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Department */}
        <div className="w-full sm:w-44">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
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

        {/* Level */}
        <div className="w-full sm:w-32">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">{language === 'ar' ? 'جميع المستويات' : 'All Levels'}</option>
            <option value="1">{language === 'ar' ? 'المستوى 1' : 'Level 1'}</option>
            <option value="2">{language === 'ar' ? 'المستوى 2' : 'Level 2'}</option>
            <option value="3">{language === 'ar' ? 'المستوى 3' : 'Level 3'}</option>
            <option value="4">{language === 'ar' ? 'المستوى 4' : 'Level 4'}</option>
          </select>
        </div>

        {/* Status */}
        <div className="w-full sm:w-40">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{language === 'ar' ? 'منتظم' : 'Active'}</option>
            <option value="deprivation_risk">{language === 'ar' ? 'خطر حرمان' : 'Deprivation Risk'}</option>
            <option value="attendance_warning">{language === 'ar' ? 'إنذار غياب' : 'Attendance Warning'}</option>
            <option value="honors">{language === 'ar' ? 'لوحة الشرف' : 'Honors'}</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
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

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            {language === 'ar'
              ? `قائمة الطلاب (${filteredStudents.length} طلاب)`
              : `Student Directory (${filteredStudents.length})`}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            HITU Student Database v1.0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'HITU ID'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'اسم الطالب' : 'Name'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'القسم' : 'Dept'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'المستوى' : 'Level'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'المعدل (GPA)' : 'CGPA'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'نسبة الغياب' : 'Absence %'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'تشخيص النظام' : 'Status'}</th>
                <th className="py-3 px-4 text-start">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {language === 'ar' ? 'لا يوجد طلاب يطابقون معايير البحث' : 'No students found'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const dept = departments.find((d) => d.id === student.departmentId);
                  const studentAttendance = attendanceRecords.filter((r) => r.studentId === student.id);
                  let p = 0; let l = 0; let e = 0;
                  for (const r of studentAttendance) {
                    if (r.status === 'present') p++;
                    else if (r.status === 'late') l++;
                    else if (r.status === 'excused') e++;
                  }
                  const { absenceRate } = calculateAttendancePercentage(p, l, e, studentAttendance.length);
                  const warningTier = getAbsenceWarningTier(absenceRate);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {language === 'ar' ? student.nameAr : student.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {dept?.code || student.departmentId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {language === 'ar' ? `مستوى ${student.academicLevel}` : `L${student.academicLevel}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {student.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            absenceRate >= 25
                              ? 'text-red-600 font-bold'
                              : absenceRate >= 15
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {absenceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${warningTier.colorClass}`}>
                          {language === 'ar' ? warningTier.labelAr : warningTier.labelEn}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailStudentId(student.id)}
                            title={language === 'ar' ? 'عرض السجل الأكاديمي' : 'View Profile'}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (onSelectStudentForExpert) {
                                onSelectStudentForExpert(student.id);
                              }
                              setActiveTab('expert-system');
                            }}
                            title={language === 'ar' ? 'فحص بالنظام الخبير' : 'Expert System'}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Delete student?')) {
                                  deleteStudent(student.id);
                                }
                              }}
                              title={language === 'ar' ? 'حذف' : 'Delete'}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        studentId={detailStudentId}
        onClose={() => setDetailStudentId(null)}
        onOpenExpert={(id) => {
          if (onSelectStudentForExpert) onSelectStudentForExpert(id);
          setActiveTab('expert-system');
        }}
      />

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {language === 'ar' ? 'إضافة طالب جديد في جامعة حلوان التكنولوجية' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الرقم الجامعي' : 'Student ID'} *</label>
                  <input
                    type="text"
                    required
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الرقم القومي' : 'National ID'} *</label>
                  <input
                    type="text"
                    required
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الاسم باللغة العربية' : 'Arabic Name'} *</label>
                  <input
                    type="text"
                    required
                    value={newNameAr}
                    onChange={(e) => setNewNameAr(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'القسم التكنولوجي' : 'Department'} *</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'المستوى الدراسي' : 'Level'} *</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={1}>المستوى 1</option>
                    <option value={2}>المستوى 2</option>
                    <option value={3}>المستوى 3</option>
                    <option value={4}>المستوى 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'المعدل التراكمي الأولي (GPA)' : 'CGPA'} *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={newGpa}
                    onChange={(e) => setNewGpa(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  {language === 'ar' ? 'حفظ الطالب' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
