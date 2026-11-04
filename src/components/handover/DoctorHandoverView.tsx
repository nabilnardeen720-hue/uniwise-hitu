import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
  CalendarCheck,
  Cpu,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

export const DoctorHandoverView: React.FC = () => {
  const {
    language,
    setActiveTab,
    isProductionCleanMode,
    clearTestDataForProduction,
    resetToDemoData,
  } = useApp();

  const isRTL = language === 'ar';

  const [activeDocTab, setActiveDocTab] = useState<
    'overview' | 'scenario' | 'handover_ar' | 'architecture' | 'database' | 'readiness' | 'test_report'
  >('scenario');

  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);

  // 13 Presentation steps mapped to prompt section 13
  const demoSteps = [
    {
      step: 1,
      titleAr: '1. استعراض هوية المنصة الجامعية الموحدة',
      titleEn: '1. University Brand & Unified Identity',
      descAr: 'إظهار هوية جامعة حلوان التكنولوجية الدولية (HITU) والشعار الموحد للمنصة.',
      descEn: 'Display HITU official university identity across the portal.',
      targetTab: 'overview',
    },
    {
      step: 2,
      titleAr: '2. تسجيل الدخول وتبديل الصلاحيات (RBAC)',
      titleEn: '2. Unified Authentication & Role Switcher',
      descAr: 'استعراض الصلاحيات الأربعة: مسؤول النظام، عضو هيئة تدريس، خبير أكاديمي، طالب.',
      descEn: 'Demo the 4 distinct roles: Admin, Doctor, Academic Expert, and Student.',
      targetTab: 'overview',
    },
    {
      step: 3,
      titleAr: '3. لوحة تحكم ومؤشرات الأداء العامة',
      titleEn: '3. Executive Dashboard & Live Metrics',
      descAr: 'استعراض بطاقات الإحصائيات الحية، نسب الحضور العامة، وحالات الخطر.',
      descEn: 'Inspect KPI cards: enrolled students, attendance rate, deprivation alarms.',
      targetTab: 'overview',
    },
    {
      step: 4,
      titleAr: '4. نظام إدارة شؤون الطلاب والسجلات',
      titleEn: '4. Student Management & Profiles',
      descAr: 'البحث، الفلترة حسب القسم والمستوى، واستعراض السجل الأكاديمي الشامل.',
      descEn: 'Filter students, view detailed academic transcripts and attendance meters.',
      targetTab: 'students',
    },
    {
      step: 5,
      titleAr: '5. نظام تسجيل ومتابعة الحضور والغياب (المدمج)',
      titleEn: '5. Integrated Attendance Management System',
      descAr: 'استعراض وظائف مشروع الزملاء المدمجة بالكامل دون حذف أي ميزة.',
      descEn: 'Review the fully integrated attendance module with sessions and roster.',
      targetTab: 'attendance',
    },
    {
      step: 6,
      titleAr: '6. تسجيل حضور فوري لمحاضرة جديدة',
      titleEn: '6. Record Live Attendance Session',
      descAr: 'اختيار المقرر، استخدام زر "تحضير الكل حاضر"، وتحديد غياب وتأخر.',
      descEn: 'Select course, mark all present with 1-click, and submit attendance.',
      targetTab: 'attendance',
    },
    {
      step: 7,
      titleAr: '7. تقارير الغياب وسجلات الحرمان اللائحية',
      titleEn: '7. Absence Reports & 25% Threshold Alerts',
      descAr: 'متابعة تصنيف حدود الغياب: آمن (<10%)، إنذار أول (10%)، إنذار ثانٍ (15%)، حرمان (25%).',
      descEn: 'Verify statutory absence warnings based on HITU technological bylaws.',
      targetTab: 'attendance',
    },
    {
      step: 8,
      titleAr: '8. الانتقال إلى النظام الخبير (محور المشروع)',
      titleEn: '8. Transition to Expert System (Core Feature)',
      descAr: 'تغذية النظام الخبير تلقائياً ببيانات الحضور والغياب ودرجات المقررات.',
      descEn: 'Seamlessly pass attendance metrics and grades to the inference engine.',
      targetTab: 'expert-system',
    },
    {
      step: 9,
      titleAr: '9. فحص حالة الطالب الاختبارية (أحمد طارق 202410103)',
      titleEn: '9. Inspect Demo Student Case (Ahmed Tarek 202410103)',
      descAr: 'طالب يعاني من غياب 28% في مقرر وانخفاض بالميدتيرم والمعدل.',
      descEn: 'Inspect at-risk student with high absence and concurrent grade drop.',
      targetTab: 'expert-system',
    },
    {
      step: 10,
      titleAr: '10. تشغيل الاستدلال الأمامي (Forward Chaining Trace)',
      titleEn: '10. Run Forward Chaining & Inference Trace',
      descAr: 'مشاهدة مطابقة شروط القواعد (RULE-ATT-01, RULE-EXP-01, RULE-EXP-02) وتفعيلها.',
      descEn: 'Watch pattern matching against student working memory and rule firing.',
      targetTab: 'expert-system',
    },
    {
      step: 11,
      titleAr: '11. نظام التعليل والتفسير الشامل (Explanation Facility)',
      titleEn: '11. Explanation Facility (Why & How Reasoning)',
      descAr: 'استعراض إجابة "لماذا اتخذ النظام القرار؟" بالأرقام، و"كيف تم استنتاجه؟".',
      descEn: 'Review quantified evidence and full reasoning chain behind the diagnosis.',
      targetTab: 'expert-system',
    },
    {
      step: 12,
      titleAr: '12. التوصيات الأكاديمية اللائحية المعتمدة',
      titleEn: '12. Actionable University Recommendations',
      descAr: 'توصيات الحرمان، الإرشاد الأكاديمي، وتخفيض الساعات المعتمدة.',
      descEn: 'Review proposed institutional actions: counseling referral and exam bar.',
      targetTab: 'expert-system',
    },
    {
      step: 13,
      titleAr: '13. استيراد بيانات الجامعة الرسمية والتشغيل النظيف',
      titleEn: '13. Official Data Import & Clean Production Mode',
      descAr: 'جاهزية المنصة لاستقبال بيانات الجامعة الرسمية عبر CSV/Excel وتنظيف بيانات الاختبار.',
      descEn: 'Demonstrate clean production reset and CSV validation for university launch.',
      targetTab: 'import',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-amber-600/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>جامعة حلوان التكنولوجية الدولية (HITU) • ملفات الاستلام والعرض</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'ar'
                ? 'دليل وسيناريو تسليم المشروع للدكتور والمناقشة الرسمية'
                : 'Project Handover & Doctor Presentation Guide'}
            </h2>
            <p className="text-xs text-amber-100/80 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'دليل استرشادي منظم لمناقشة دمج مشروعي UniWise ونظام الغياب أمام الدكتور، يشمل سيناريو العرض خطوة بخطوة، والوثائق الهندسية، وآلية تصفير بيانات الاختبار للاستخدام الرسمي.'
                : 'Step-by-step presentation scenario and comprehensive engineering handover documentation.'}
            </p>
          </div>

          {/* Environment Mode Switcher */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
            <span className="text-[11px] font-bold text-slate-300">
              {language === 'ar' ? 'بيئة تشغيل المنصة:' : 'Platform Environment:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetToDemoData}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isProductionCleanMode
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'ar' ? 'عرض تجريبي (Demo)' : 'Demo Mode'}
              </button>

              <button
                onClick={() => {
                  if (window.confirm(language === 'ar' ? 'هل تريد تنظيف بيانات الطلاب التجريبية وتهيئة النظام للاستخدام الجامعي الرسمي؟' : 'Clear demo records for clean university production?')) {
                    clearTestDataForProduction();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isProductionCleanMode
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'ar' ? 'تشغيل نظيف (Clean)' : 'Clean Production'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              {isProductionCleanMode
                ? language === 'ar'
                  ? 'تم تفريغ بيانات الاختبار، المنصة جاهزة لاستيراد ملفات الجامعة'
                  : 'Clean state ready for official records'
                : language === 'ar'
                ? 'محمل بحالات الاختبار المعتمدة للشرح العملي'
                : 'Demo cases pre-loaded for presentation'}
            </span>
          </div>
        </div>
      </div>

      {/* Handover Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveDocTab('scenario')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'scenario'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '🎬 سيناريو العرض خطوة بخطوة (13 خطوة)' : 'Presentation Scenario'}
        </button>

        <button
          onClick={() => setActiveDocTab('handover_ar')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'handover_ar'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '📄 دليل تسليم الدكتور (DOCTOR_HANDOVER_AR)' : 'Doctor Handover AR'}
        </button>

        <button
          onClick={() => setActiveDocTab('architecture')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'architecture'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '🏛️ معمارية النظام (ARCHITECTURE)' : 'Architecture AR'}
        </button>

        <button
          onClick={() => setActiveDocTab('database')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'database'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '🗄️ توثيق قاعدة البيانات (DATABASE)' : 'Database Docs'}
        </button>

        <button
          onClick={() => setActiveDocTab('readiness')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'readiness'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '🚀 تقرير الجاهزية (PRODUCTION_READINESS)' : 'Readiness Report'}
        </button>

        <button
          onClick={() => setActiveDocTab('test_report')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeDocTab === 'test_report'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ar' ? '🧪 نتائج الاختبارات الفعلية (TEST_REPORT)' : 'Test Report'}
        </button>
      </div>

      {/* TAB 1: 13-STEP PRESENTATION SCENARIO */}
      {activeDocTab === 'scenario' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'خطوات العرض التقديمي الموصى بها أمام الدكتور:' : 'Recommended 13-Step Presentation Flow:'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'انقر على زر "تجربة الآن" في كل خطوة للانتقال المباشر للواجهة أثناء العرض الشفهي.'
                  : 'Click "Launch Step" to jump directly to the relevant screen during your oral demo.'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              13 Steps
            </span>
          </div>

          <div className="space-y-3">
            {demoSteps.map((step) => (
              <div
                key={step.step}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {language === 'ar' ? step.titleAr : step.titleEn}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {language === 'ar' ? step.descAr : step.descEn}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab(step.targetTab)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <span>{language === 'ar' ? 'تجربة هذه الخطوة' : 'Launch Step'}</span>
                  {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEWS */}
      {activeDocTab !== 'scenario' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {activeDocTab === 'handover_ar' && 'دليل تسليم المشروع للدكتور (DOCTOR_HANDOVER_AR.md)'}
                {activeDocTab === 'architecture' && 'معمارية النظام المتكامل (SYSTEM_ARCHITECTURE_AR.md)'}
                {activeDocTab === 'database' && 'توثيق قاعدة البيانات والعلاقات (DATABASE_DOCUMENTATION_AR.md)'}
                {activeDocTab === 'readiness' && 'تقرير الجاهزية للتشغيل الجامعي (PRODUCTION_READINESS_AR.md)'}
                {activeDocTab === 'test_report' && 'تقرير الاختبارات الفعلية (TEST_REPORT_AR.md)'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'الوثيقة منشأة في مسار المشروع الرئيسي وجاهزة للتقديم والمناقشة' : 'Document available in workspace root'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-[60vh] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {activeDocTab === 'handover_ar' && (
              `# دليل تسليم المنصة الجامعية الذكية المتكاملة للدكتور
اسم المنصة: UniWise – HITU
الجامعة: جامعة حلوان التكنولوجية الدولية (Helwan Int'l Technological University - HITU)

1. فكرة المنصة:
دمج مشروعين جامعيين متقدمين:
- UniWise: النظام الخبير والاستدلال الأمامي (Forward Chaining) ونظام التعليل (Explanation Facility).
- Attendance Management System: نظام تسجيل ومتابعة الحضور والغياب وتتبع نسبة الـ 25% للحرمان.

2. الميزة الأساسية للدمج:
تحويل بيانات الغياب والحضور من مجرد سجلات خاملة إلى حقائق ديناميكية تغذي الذاكرة العاملة (Working Memory) لمحرك الاستدلال، مما يتيح الكشف المبكر عن خطر الحرمان والتعثر الأكاديمي وتقديم توصيات لائحية فورية.

3. الأدوار الأكاديمية المدعومة:
- مسؤول النظام (Admin)
- عضو هيئة التدريس (Doctor)
- خبير أكاديمي / مرشد (Academic Expert)
- طالب جامعي (Student)

4. سيناريو الاختبار المعتمد أمام الدكتور:
الطالب: أحمد طارق محمود (الرقم الجامعي: 202410103)
- نسبة غيابه في مقرر IT-301 تجاوزت 25% (28%).
- انقطاع 3 محاضرات متتالية.
- درجة الميدتيرم 8/20 ومعدله التراكمي 1.92.
- النتيجة: تفعيل القواعد (RULE-ATT-01, RULE-EXP-01, RULE-EXP-02) وتوليد إشعار حرمان وتوصية بالإرشاد المشدد.`
            )}

            {activeDocTab === 'architecture' && (
              `# معمارية النظام المتكامل (System Architecture)
UniWise – HITU

- الواجهة الأمامية: React 19 + TypeScript + Tailwind CSS v4.
- إدارة الحالة والتكامل: Reactive AppContext مع مزامنة الذاكرة المحلية والتدقيق (Audit Trail).
- محرك الاستدلال: Forward Chaining Engine مستقل ونقي (Pure Function) مدعوم باختبارات Unit Tests.
- الذاكرة العاملة (Working Memory): استخلاص تلقائي للحقائق (Facts Extraction) من جداول الحضور والدرجات.
- واجهة ثنائية اللغة: دعم كامل للعربية (RTL افتراضي) والإنجليزية (LTR).`
            )}

            {activeDocTab === 'database' && (
              `# توثيق قاعدة البيانات المتكاملة والعلاقات
UniWise – HITU

الجداول المترابطة:
1. Users (المستخدمون والأدوار RBAC)
2. Departments (الأقسام التكنولوجية: IT, MT, AT, HT)
3. Courses (المقررات التكنولوجية والساعات المعتمدة)
4. Students (الطلاب والأرقام الجامعية والمعدل وحالات التعثر)
5. Doctors (أعضاء هيئة التدريس والمقررات المسندة)
6. LectureSessions (جلسات المحاضرات والمعامل)
7. AttendanceRecords (سجلات الحضور اليومية: حاضر، غائب، متأخر، معذور)
8. GradeRecords (درجات أعمال السنة، الميدتيرم، العملي، النهائي)
9. ProductionRules (قواعد الإنتاج في قاعدة المعرفة IF ... THEN)
10. AuditLogs (سجل العمليات الإدارية والأمنية)
11. Notifications (التنبيهات الأكاديمية واللائحية)`
            )}

            {activeDocTab === 'readiness' && (
              `# تقرير الجاهزية والاستلام للجامعة (Production Readiness)
UniWise – HITU

- حالة النظام: جاهز للعرض والمناقشة، ومزود بزر تصفير البيانات التجريبية للانتقال إلى البيئة الإنتاجية الرسمية.
- آلية الاستيراد: تدعم CSV/Excel مع تدقيق مسبق لاكتشاف الأرقام الجامعية المكررة.
- متطلبات الاستخدام الرسمي في الجامعة:
  1. اعتماد اللائحة الداخلية للغياب (نسبة الـ 25%) من مجلس كلية جامعة حلوان التكنولوجية.
  2. استيراد كشوف الطلاب الرسمية عبر بوابة الاستيراد.
  3. ربط خادم قاعدة البيانات PostgreSQL المركزي عند النشر السحابي.`
            )}

            {activeDocTab === 'test_report' && (
              `# تقرير الاختبارات الفعلية للمنصة
UniWise – HITU

1. اختبارات الوحدة المنطقية (Unit Tests via node:test):
- academicCalculations.test.ts: 6/6 tests passed (نسب الحضور، أوزان التأخير، نقاط التقدير، فئات الإنذار).
- inferenceEngine.test.ts: 2/2 tests passed (تفعيل قاعدة الحرمان RULE-ATT-01، وتفعيل لوحة الشرف RULE-EXP-04).
الإجمالي: 8/8 اختبارات وحدة نجحت بنسبة 100%.

2. اختبارات تدفق المستخدم (User Journeys):
- تسجيل الحضور واعتماد الجلسة: ناجح.
- استخراج حقائق الذاكرة العاملة وتشغيل الاستدلال: ناجح.
- توليد التعليل والتفسير بالأرقام الصريحة: ناجح.
- تصدير التقارير واستيراد ملفات الطلاب: ناجح.`
            )}
          </div>
        </div>
      )}
    </div>
  );
};
