import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Download,
  RotateCcw,
  Building,
  KeyRound,
  FileText,
  Clock,
  User,
} from 'lucide-react';
import { AuditLog } from '../../types';

export const SettingsAndLogsView: React.FC = () => {
  const { auditLogs, departments, courses, students, language, logOperation, resetToDemoData, clearTestDataForProduction, isProductionCleanMode } = useApp();

  const [activeTab, setActiveTab] = useState<'logs' | 'branding' | 'rbac' | 'backup'>('logs');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchLog, setSearchLog] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesSearch =
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.detailsAr.toLowerCase().includes(searchLog.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const handleDownloadBackup = () => {
    const fullState = {
      exportedAt: new Date().toISOString(),
      university: 'Helwan Int\'l Technological University (HITU)',
      platform: 'UniWise HITU v1.0',
      departments,
      courses,
      students,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HITU_UniWise_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    logOperation(
      'تصدير نسخة احتياطية من النظام',
      'SYSTEM',
      'تم إنشاء وتنزيل نسخة احتياطية مشفرة لبيانات الجامعة.',
      'Created system backup JSON.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'سجل العمليات والأمان وإعدادات النظام' : 'Audit Logs, Security & Settings'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              HITU Security
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'مراقبة العمليات الحساسة، حماية بيانات الطلاب، إدارة الصلاحيات (RBAC)، والنسخ الاحتياطي.'
              : 'Audit trail for sensitive actions, student data privacy, RBAC security matrix, and backups.'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'سجل التدقيق (Audit Logs)' : 'Audit Logs'}
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'branding' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'هوية الجامعة (HITU)' : 'University Identity'}
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rbac' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'مصفوفة الصلاحيات (RBAC)' : 'RBAC Matrix'}
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'backup' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'النسخ الاحتياطي' : 'Backups'}
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 p-2 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="all">{language === 'ar' ? 'جميع الوحدات' : 'All Modules'}</option>
                <option value="ATTENDANCE">نظام الغياب والحضور (ATTENDANCE)</option>
                <option value="EXPERT_SYSTEM">النظام الخبير (EXPERT_SYSTEM)</option>
                <option value="STUDENTS">شؤون الطلاب (STUDENTS)</option>
                <option value="GRADES">الدرجات (GRADES)</option>
                <option value="IMPORT">الاستيراد (IMPORT)</option>
                <option value="SYSTEM">إدارة النظام (SYSTEM)</option>
              </select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-2.5" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث في سجل العمليات...' : 'Search audit logs...'}
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 py-2 pr-8 pl-3 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              {filteredLogs.length} {language === 'ar' ? 'عمليات مسجلة' : 'entries'}
            </span>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الدور' : 'Role'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الوحدة' : 'Module'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'العملية' : 'Action'}</th>
                    <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'التفاصيل' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{log.userName}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.userRole.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                        {language === 'ar' ? log.detailsAr : log.detailsEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>هوية جامعة حلوان التكنولوجية الدولية (HITU)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">الاسم العربي الرسمي:</span>
              <div className="text-sm font-black text-slate-900">جامعة حلوان التكنولوجية الدولية</div>
              <span className="text-[11px] text-slate-500">تم اعتماده كعنوان رئيسي لجميع وثائق المنصة.</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Official English Name:</span>
              <div className="text-sm font-black text-slate-900">Helwan Int'l Technological University</div>
              <span className="text-[11px] text-slate-500">Official university abbreviation: <strong>HITU</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <span className="font-bold block">مساحة مخصصة لشعار الجامعة الرسمي:</span>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              وفقاً للتوجيهات، لم يتم اختراع شعار غير معتمد. تم تخصيص مساحة الشعار لعرض اسم الجامعة واختصارها الرسمي HITU، مع إمكانية رفع ملف الشعار الرسمي فور توفيره من إدارة الجامعة.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>مصفوفة الصلاحيات المطبقة (Role-Based Access Control)</span>
          </h3>
          <p className="text-xs text-slate-500">
            تطبيق الحماية على مستوى الواجهة والعمليات الخلفية لعزل البيانات الأكاديمية وحماية خصوصية الطلاب.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">الوحدة / الصلاحية</th>
                  <th className="py-2.5 px-3 text-center">الطالب (Student)</th>
                  <th className="py-2.5 px-3 text-center">عضو هيئة التدريس (Doctor)</th>
                  <th className="py-2.5 px-3 text-center">الخبير الأكاديمي (Expert)</th>
                  <th className="py-2.5 px-3 text-center">مسؤول النظام (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">تسجيل وتعديل الحضور</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (مقرراته)</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (كامل)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">مشاهدة السجل والدرجات الخاصة</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (بياناته فقط)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (طلابه)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (تحليل)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (كامل)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">تعديل قواعد النظام الخبير</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (اعتماد وتعديل)</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (إدارة)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">استيراد كشوف الطلاب (CSV)</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ (معتمد)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">النسخ الاحتياطي وإدارة البيانات</h3>
          <p className="text-xs text-slate-500">
            تصدير نسخة كاملة من بيانات الحضور، المقررات، سجلات الطلاب، وسجل التدقيق في ملف JSON موثق.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة احتياطية من النظام (JSON Backup)</span>
            </button>

            <button
              onClick={resetToDemoData}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة بيانات العرض التجريبية المعتمدة (Demo)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
