import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  FileText,
  UploadCloud,
  Sliders,
  FolderGit2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, language, currentUser, isProductionCleanMode } = useApp();

  const isRTL = language === 'ar';

  const navItems = [
    {
      id: 'overview',
      labelAr: 'لوحة التحكم',
      labelEn: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
      roles: ['admin', 'doctor', 'expert', 'student'],
    },
    {
      id: 'students',
      labelAr: 'شؤون الطلاب',
      labelEn: 'Student Directory',
      icon: Users,
      badge: 'HITU',
      roles: ['admin', 'doctor', 'expert'],
    },
    {
      id: 'attendance',
      labelAr: 'نظام الحضور والغياب',
      labelEn: 'Attendance System',
      icon: CalendarCheck,
      badge: 'مدمج',
      roles: ['admin', 'doctor', 'expert', 'student'],
    },
    {
      id: 'academic',
      labelAr: 'الإدارة الأكاديمية والدرجات',
      labelEn: 'Academic & Grades',
      icon: GraduationCap,
      badge: undefined,
      roles: ['admin', 'doctor', 'expert'],
    },
    {
      id: 'expert-system',
      labelAr: 'النظام الخبير والاستدلال',
      labelEn: 'Expert System Studio',
      icon: Sparkles,
      badge: 'الذكاء',
      badgeClass: 'bg-purple-100 text-purple-700 font-bold',
      roles: ['admin', 'doctor', 'expert', 'student'],
    },
    {
      id: 'reports',
      labelAr: 'التقارير وسجلات الحرمان',
      labelEn: 'Reports & Transcripts',
      icon: FileText,
      badge: undefined,
      roles: ['admin', 'doctor', 'expert', 'student'],
    },
    {
      id: 'import',
      labelAr: 'استيراد البيانات الرسمية',
      labelEn: 'Data Import & CSV',
      icon: UploadCloud,
      badge: 'Excel',
      roles: ['admin', 'expert'],
    },
    {
      id: 'knowledge-base',
      labelAr: 'إدارة قواعد المعرفة',
      labelEn: 'Knowledge Base Rules',
      icon: Sliders,
      badge: 'IF-THEN',
      roles: ['admin', 'expert'],
    },
    {
      id: 'handover',
      labelAr: 'دليل وسيناريو تسليم الدكتور',
      labelEn: 'Doctor Handover & Demo',
      icon: FolderGit2,
      badge: 'هام',
      badgeClass: 'bg-amber-100 text-amber-800 font-bold',
      roles: ['admin', 'doctor', 'expert', 'student'],
    },
    {
      id: 'settings',
      labelAr: 'سجل العمليات والأمان',
      labelEn: 'Audit Logs & Settings',
      icon: ShieldAlert,
      badge: undefined,
      roles: ['admin', 'expert'],
    },
  ];

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[85px] z-50 md:z-20 h-screen md:h-[calc(100vh-85px)] w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full md:translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Inside Sidebar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              U
            </span>
            <span className="font-bold text-white text-sm">UniWise – HITU</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* University Sub-Header */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ar' ? 'الوحدات الأكاديمية المدمجة' : 'Integrated Modules'}
          </div>
          <div className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
            جامعة حلوان التكنولوجية الدولية
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="truncate">
                    {language === 'ar' ? item.labelAr : item.labelEn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        item.badgeClass ||
                        (isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="text-indigo-200">
                      {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Handover & Environment Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <button
            onClick={() => {
              setActiveTab('handover');
              if (onClose) onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 text-start hover:border-indigo-500/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
                {language === 'ar' ? 'ملفات تسليم الدكتور' : 'Doctor Handover'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                6 Docs
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-1">
              {language === 'ar'
                ? 'جاهز للاستعراض والتسليم الرسمي'
                : 'Ready for evaluation & handover'}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};
