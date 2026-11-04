import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { TakeAttendanceModal } from './components/attendance/TakeAttendanceModal';
import { ExpertSystemView } from './components/expert-system/ExpertSystemView';
import { StudentManagement } from './components/students/StudentManagement';
import { AcademicManagement } from './components/academic/AcademicManagement';
import { ReportsView } from './components/reports/ReportsView';
import { DataImportView } from './components/import/DataImportView';
import { DoctorHandoverView } from './components/handover/DoctorHandoverView';
import { SettingsAndLogsView } from './components/settings/SettingsAndLogsView';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, language } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | undefined>(undefined);
  const [selectedStudentForExpert, setSelectedStudentForExpert] = useState<string | undefined>(undefined);

  const handleOpenTakeAttendance = (courseId?: string) => {
    setPreselectedCourseId(courseId);
    setIsTakeAttendanceOpen(true);
  };

  const handleSelectStudentForExpert = (studentId: string) => {
    setSelectedStudentForExpert(studentId);
    setActiveTab('expert-system');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Unified Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onOpenTakeAttendance={() => handleOpenTakeAttendance()}
              onSelectStudentForExpert={handleSelectStudentForExpert}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              onSelectStudentForExpert={handleSelectStudentForExpert}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManagement
              onOpenTakeAttendance={handleOpenTakeAttendance}
              onSelectStudentForExpert={handleSelectStudentForExpert}
            />
          )}

          {activeTab === 'academic' && <AcademicManagement />}

          {(activeTab === 'expert-system' || activeTab === 'knowledge-base') && (
            <ExpertSystemView
              initialSelectedStudentId={selectedStudentForExpert}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'import' && <DataImportView />}

          {activeTab === 'handover' && <DoctorHandoverView />}

          {activeTab === 'settings' && <SettingsAndLogsView />}
        </main>
      </div>

      {/* Quick Take Attendance Modal */}
      <TakeAttendanceModal
        isOpen={isTakeAttendanceOpen}
        onClose={() => setIsTakeAttendanceOpen(false)}
        preselectedCourseId={preselectedCourseId}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">UniWise – HITU</span>
            <span>•</span>
            <span>جامعة حلوان التكنولوجية الدولية (Helwan Int'l Technological University)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            المنصة الجامعية الذكية المتكاملة • رصد الحضور والغياب • النظام الخبير والاستدلال اللائحي
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
