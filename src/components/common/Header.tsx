import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  GraduationCap,
  Bell,
  Globe,
  UserCheck,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    switchUserRole,
    language,
    toggleLanguage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    isProductionCleanMode,
    setActiveTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<Role, { ar: string; en: string; badgeClass: string; icon: any }> = {
    admin: {
      ar: 'مسؤول النظام (Admin)',
      en: 'System Administrator',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Shield,
    },
    doctor: {
      ar: 'عضو هيئة تدريس (Doctor)',
      en: 'Faculty Member',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: BookOpen,
    },
    expert: {
      ar: 'خبير أكاديمي (Expert)',
      en: 'Academic Expert',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Sparkles,
    },
    student: {
      ar: 'طالب جامعي (Student)',
      en: 'Undergraduate Student',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: GraduationCap,
    },
  };

  const currentRoleInfo = roleLabels[currentUser.role];
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top University Identity Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-amber-300 font-bold tracking-wide">
              جامعة حلوان التكنولوجية الدولية
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200 font-normal">
              Helwan Int'l Technological University (HITU)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-semibold">
                HITU-PORTAL
              </span>
              <span>المنصة الجامعية الذكية المتكاملة</span>
            </span>

            {isProductionCleanMode ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>بيئة الإنتاج الرسمية (Clean)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[11px]">
                <Sparkles className="w-3 h-3" />
                <span>بيئة العرض التجريبية للدكتور (Demo)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left / Brand Area */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="القائمة الجانبية"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-400/20">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>UniWise</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    HITU
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {language === 'ar'
                  ? 'النظام الخبير وإدارة الحضور والأداء الأكاديمي'
                  : 'Intelligent University & Expert Attendance System'}
              </p>
            </div>
          </div>
        </div>

        {/* Right / Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Print Quick Button */}
          <button
            onClick={() => window.print()}
            aria-label="طباعة التقرير"
            title="طباعة التقرير الرسمي"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'طباعة رسمية' : 'Print View'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            aria-label="تبديل اللغة"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="التنبيهات"
              className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100`}
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">
                    {language === 'ar' ? 'التنبيهات الأكاديمية' : 'Academic Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {language === 'ar' ? 'لا توجد تنبيهات جديدة' : 'No notifications'}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkTab) setActiveTab(notif.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.type === 'danger' && (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'info' && (
                            <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">
                              {language === 'ar' ? notif.titleAr : notif.titleEn}
                            </p>
                            <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                              {language === 'ar' ? notif.messageAr : notif.messageEn}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString(
                                language === 'ar' ? 'ar-EG' : 'en-US',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher (For Professor & Examiner Inspection) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-right"
              aria-label="تبديل الدور وحساب المستخدم"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <RoleIcon className="w-3.5 h-3.5 text-indigo-700" />
              </div>
              <div className="hidden sm:block text-start">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {language === 'ar' ? currentUser.nameAr : currentUser.nameEn}
                </div>
                <div className="text-[10px] text-indigo-600 font-medium">
                  {language === 'ar' ? currentRoleInfo.ar : currentRoleInfo.en}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showRoleMenu && (
              <div
                className={`absolute ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50`}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700">
                    {language === 'ar'
                      ? 'تبديل الدور الأكاديمي للاختبار'
                      : 'Switch Role for Inspection'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'استعرض المنصة بصلاحيات كل دور أمام الدكتور'
                      : 'Demo all RBAC roles live before the professor'}
                  </p>
                </div>

                <div className="p-1 space-y-1">
                  {(['admin', 'doctor', 'expert', 'student'] as Role[]).map((r) => {
                    const info = roleLabels[r];
                    const Icon = info.icon;
                    const isSelected = currentUser.role === r;

                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchUserRole(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span>{language === 'ar' ? info.ar : info.en}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 pt-1 border-t border-slate-100 px-3 py-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('handover');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
                  >
                    {language === 'ar' ? '📂 دليل وسيناريو تسليم المشروع' : '📂 Presentation Guide'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
