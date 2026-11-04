import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Cpu,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Play,
  RotateCcw,
  BookOpen,
  Info,
} from 'lucide-react';
import { Student, ProductionRule, InferenceResult } from '../../types';

interface ExpertSystemViewProps {
  initialSelectedStudentId?: string;
}

export const ExpertSystemView: React.FC<ExpertSystemViewProps> = ({
  initialSelectedStudentId,
}) => {
  const {
    students,
    courses,
    productionRules,
    evaluateStudentWithExpertSystem,
    evaluateAllStudents,
    toggleRuleActive,
    updateProductionRule,
    language,
    currentUser,
    logOperation,
  } = useApp();

  const isRTL = language === 'ar';

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialSelectedStudentId || students[0]?.id || ''
  );

  const [activeTab, setActiveTab] = useState<'inference' | 'rules' | 'batch'>('inference');
  const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [expandedTraceRuleId, setExpandedTraceRuleId] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    if (initialSelectedStudentId) {
      setSelectedStudentId(initialSelectedStudentId);
    }
  }, [initialSelectedStudentId]);

  // Run evaluation whenever student changes or on initial mount
  useEffect(() => {
    if (selectedStudentId) {
      const res = evaluateStudentWithExpertSystem(selectedStudentId);
      setInferenceResult(res);
    }
  }, [selectedStudentId]);

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = evaluateStudentWithExpertSystem(selectedStudentId);
      setInferenceResult(res);
      setIsEvaluating(false);

      const targetStudent = students.find((s) => s.id === selectedStudentId);
      logOperation(
        `تشغيل الاستدلال الأمامي: ${targetStudent?.nameAr}`,
        'EXPERT_SYSTEM',
        `تم تشغيل محرك الاستدلال وقواعد الإنتاج على الطالب [${targetStudent?.studentId}]. القواعد المفعلة: ${res?.firedRules.length || 0}.`,
        `Executed forward chaining on student [${targetStudent?.studentId}]. Fired rules: ${res?.firedRules.length || 0}.`
      );
    }, 400);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Severity color mapping
  const riskBadges = {
    critical: {
      labelAr: 'حرج جداً: خطر حرمان أكاديمي',
      labelEn: 'Critical: Deprivation Risk',
      class: 'bg-red-100 text-red-800 border-red-300',
      icon: AlertOctagon,
    },
    high: {
      labelAr: 'مرتفع: تعثر أكاديمي مركب',
      labelEn: 'High: Compound Academic Risk',
      class: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
    },
    moderate: {
      labelAr: 'متوسط: إنذار مبكر ومتابعة',
      labelEn: 'Moderate: Early Warning',
      class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
    },
    low: {
      labelAr: 'منخفض: أداء مقبول',
      labelEn: 'Low: Acceptable',
      class: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Info,
    },
    safe: {
      labelAr: 'آمن ومتميز: لوحة الشرف',
      labelEn: 'Safe: Honors & Excellence',
      class: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
    },
  };

  const currentRisk = inferenceResult ? riskBadges[inferenceResult.riskLevel] : riskBadges.safe;
  const RiskIcon = currentRisk.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? (
                <>
                  استوديو النظام الخبير ومحرك الاستدلال{' '}
                  <span dir="ltr" className="font-mono text-purple-700 text-base font-bold">
                    (Forward Chaining)
                  </span>
                </>
              ) : (
                'Expert System Studio & Forward Chaining Engine'
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'تحليل بيانات الحضور والأداء الأكاديمي عبر قواعد الإنتاج (Production Rules) مع نظام التعليل والتفسير الشامل.'
              : 'Evaluates dynamic attendance and grade facts using forward chaining rules with full explanation facility.'}
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inference')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inference'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'جلسة الاستدلال والتعليل' : 'Inference Session'}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'قاعدة المعرفة (Rules)' : 'Knowledge Base'}
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'batch'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'تحليل شامل للكل' : 'Batch Evaluation'}
          </button>
        </div>
      </div>

      {/* TAB 1: INFERENCE SESSION & EXPLANATION FACILITY */}
      {activeTab === 'inference' && (
        <div className="space-y-6">
          {/* Student Selector Card with Quick Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar'
                    ? 'اختر الطالب لتحميل الذاكرة العاملة (Working Memory) وفحص حالته:'
                    : 'Select Student to Populate Working Memory & Infer Risk:'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 min-w-[260px] text-xs font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.studentId} - {s.nameAr} (GPA: {s.gpa.toFixed(2)})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Play className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                    <span>
                      {isEvaluating
                        ? language === 'ar'
                          ? 'جاري الاستدلال...'
                          : 'Inferring...'
                        : language === 'ar'
                        ? 'إعادة تشغيل الاستدلال'
                        : 'Run Forward Chaining'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Demo Buttons for Professor Inspection */}
              <div className="border-t md:border-t-0 md:border-s border-slate-100 md:ps-4 pt-3 md:pt-0">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  {language === 'ar' ? 'حالات تجريبية سريعة للعرض:' : 'Quick Inspection Profiles:'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId('student-1')}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
                  >
                    {language === 'ar' ? '🚨 أحمد طارق (خطر حرمان 28%)' : '🚨 Ahmed Tarek (Risk)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentId('student-2')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    {language === 'ar' ? '⭐ مريم عادل (امتياز 100%)' : '⭐ Mariam Adel (Honors)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Working Memory Snapshot Card */}
          {inferenceResult && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    {language === 'ar'
                      ? 'الذاكرة العاملة اللحظية (Working Memory Facts)'
                      : 'Real-time Working Memory Facts'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {inferenceResult.workingMemory.student.studentId}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ar' ? 'نسبة الحضور العامة' : 'Overall Attendance'}
                  </span>
                  <div className="text-xl font-extrabold text-amber-400 mt-1">
                    {inferenceResult.workingMemory.overallAttendanceRate}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {inferenceResult.workingMemory.totalPresent} {language === 'ar' ? 'من' : 'of'}{' '}
                    {inferenceResult.workingMemory.totalSessionsScheduled} {language === 'ar' ? 'محاضرة' : 'sessions'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ar' ? 'المعدل التراكمي (GPA)' : 'Cumulative GPA'}
                  </span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {inferenceResult.workingMemory.student.gpa.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {language === 'ar' ? 'الحد الحرج: 2.00' : 'Probation line: 2.00'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ar' ? 'متوسط الميدتيرم' : 'Avg Midterm'}
                  </span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {inferenceResult.workingMemory.averageMidterm} / 20
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {language === 'ar' ? 'أعمال الفصل' : 'Coursework'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'ar' ? 'المقررات المتعثرة' : 'Failed Courses'}
                  </span>
                  <div className="text-xl font-extrabold text-red-400 mt-1">
                    {inferenceResult.workingMemory.failedCoursesCount}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {language === 'ar' ? 'رسوب معتمد' : 'Deficits'}
                  </span>
                </div>
              </div>

              {/* Course-by-course Working Memory Facts */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                  {language === 'ar' ? 'حقائق المقررات المسجلة في الذاكرة:' : 'Registered Course Facts in Memory:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.values(inferenceResult.workingMemory.courseAttendance).map((c) => (
                    <div
                      key={c.courseId}
                      className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-indigo-300">{c.courseCode}</span>
                        <span className={c.rate < 75 ? 'text-red-400' : 'text-emerald-400'}>
                          {c.rate}%
                        </span>
                      </div>
                      <div className="text-slate-400 truncate">{c.courseNameAr}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{language === 'ar' ? 'غياب' : 'Absent'}: {c.absent}</span>
                        <span>{language === 'ar' ? 'تتالي' : 'Consecutive'}: {c.consecutiveAbsences}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core Explanation Facility (نظام التعليل والتفسير) */}
          {inferenceResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {language === 'ar' ? 'نظام التعليل والتفسير (Explanation Facility)' : 'Explanation Facility'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'ar'
                        ? 'تفسير منطقي كامل لكيفية وصول محرك الاستدلال لهذه النتيجة'
                        : 'Rigorous reasoning explaining how and why this conclusion was derived'}
                    </p>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs ${currentRisk.class}`}
                >
                  <RiskIcon className="w-4 h-4" />
                  <span>{language === 'ar' ? currentRisk.labelAr : currentRisk.labelEn}</span>
                </div>
              </div>

              {/* Summary Statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {language === 'ar'
                  ? inferenceResult.explanationFacility.summaryAr
                  : inferenceResult.explanationFacility.summaryEn}
              </div>

              {/* Two Column Breakdown: Evidence Points (Why) & Reasoning Chain (How) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Evidence Points (Why?) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ar' ? '1. لماذا اتخذ النظام هذا القرار؟ (المؤشرات)' : '1. Why was this decided? (Evidence)'}</span>
                  </h4>
                  <ul className="space-y-2">
                    {(language === 'ar'
                      ? inferenceResult.explanationFacility.evidencePointsAr
                      : inferenceResult.explanationFacility.evidencePointsEn
                    ).map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Reasoning Chain (How?) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>{language === 'ar' ? '2. كيف تم استنتاج النتيجة؟ (القواعد المفعلة)' : '2. How was it derived? (Rules Fired)'}</span>
                  </h4>
                  <ul className="space-y-2">
                    {(language === 'ar'
                      ? inferenceResult.explanationFacility.reasoningChainAr
                      : inferenceResult.explanationFacility.reasoningChainEn
                    ).map((chain, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{chain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'ar'
                      ? '3. التوصيات الأكاديمية المقترحة من النظام الخبير وفق لوائح الجامعة:'
                      : '3. Actionable Academic Recommendations (HITU Bylaws):'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(language === 'ar'
                    ? inferenceResult.explanationFacility.recommendationsAr
                    : inferenceResult.explanationFacility.recommendationsEn
                  ).map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 font-medium flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {language === 'ar'
                    ? 'إخلاء مسؤولية أكاديمية: نتائج النظام الخبير استشارية ومبنية على القواعد المعتمدة، ولا تعتبر قراراً رسمياً بحرمان الطالب أو تعثره إلا بعد مراجعة واعتماد لجنة شؤون التعليم والطلاب بالكلية.'
                    : 'Academic Disclaimer: Expert system outputs are advisory based on approved bylaws and do not constitute final administrative sanctions until ratified by the Faculty Council.'}
                </span>
              </div>
            </div>
          )}

          {/* Forward Chaining Inference Trace (تتبع مسار الاستدلال) */}
          {inferenceResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ar' ? 'سجل تتبع مسار الاستدلال الكامل (Inference Trace)' : 'Full Inference Trace'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'فحص جميع قواعد الإنتاج (Production Rules) وحالة مطابقة شروطها'
                      : 'Evaluation audit for every production rule in knowledge base against current facts'}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                  {inferenceResult.traceSteps.filter((s) => s.fired).length} {language === 'ar' ? 'قواعد مفعلة' : 'fired'} /{' '}
                  {inferenceResult.traceSteps.length} {language === 'ar' ? 'قواعد مفحوصة' : 'checked'}
                </span>
              </div>

              <div className="space-y-3">
                {inferenceResult.traceSteps.map((step) => {
                  const isExpanded = expandedTraceRuleId === step.ruleId;

                  return (
                    <div
                      key={step.ruleId}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        step.fired
                          ? 'border-purple-300 bg-purple-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div
                        onClick={() =>
                          setExpandedTraceRuleId(isExpanded ? null : step.ruleId)
                        }
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                              step.fired
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {step.ruleCode}
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-slate-900 block">
                              {language === 'ar' ? step.ruleNameAr : step.ruleNameEn}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {step.conditionsEvaluated.length} {language === 'ar' ? 'شروط تم تقييمها' : 'conditions checked'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {step.fired ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3" />
                              <span>{language === 'ar' ? 'تم التفعيل (Fired)' : 'Fired'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              {language === 'ar' ? 'لم يتطابق' : 'Not Matched'}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/80 border-t border-slate-200 text-xs space-y-2">
                          <span className="font-bold text-slate-700 block text-[11px]">
                            {language === 'ar' ? 'تقييم الشروط الفرعية:' : 'Sub-condition Evaluations:'}
                          </span>
                          <div className="space-y-1.5">
                            {step.conditionsEvaluated.map((cond, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2 rounded-lg bg-white border border-slate-200 flex items-start justify-between gap-2 text-[11px]"
                              >
                                <div>
                                  <span className="font-mono text-indigo-700 font-semibold">
                                    {cond.field}
                                  </span>{' '}
                                  <span className="text-slate-500">
                                    {cond.operator} {cond.threshold}
                                  </span>
                                  <div className="text-slate-600 mt-0.5">
                                    {language === 'ar' ? cond.detailsAr : cond.detailsEn}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                                    cond.passed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {cond.passed
                                    ? language === 'ar'
                                      ? 'تحقق'
                                      : 'Passed'
                                    : language === 'ar'
                                    ? 'لم يتحقق'
                                    : 'Failed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KNOWLEDGE BASE RULES VIEWER & EDITOR */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'قواعد الإنتاج المعتمدة بقاعدة المعرفة (Production Rules)' : 'Knowledge Base Production Rules'}
            </h3>
            <span className="text-xs text-slate-500">
              {productionRules.length} {language === 'ar' ? 'قواعد مسجلة' : 'rules in KB'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productionRules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                  rule.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {rule.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">v{rule.version}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {language === 'ar' ? `الأولوية ${rule.priority}` : `Priority ${rule.priority}`}
                    </span>
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        rule.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rule.active
                        ? language === 'ar'
                          ? 'مفعلة'
                          : 'Active'
                        : language === 'ar'
                        ? 'معطلة'
                        : 'Inactive'}
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900 mt-2">
                  {language === 'ar' ? rule.nameAr : rule.nameEn}
                </h4>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-indigo-700 block mb-1">
                    IF (الشرط اللائحي):
                  </span>
                  <span>{language === 'ar' ? rule.conditionDescriptionAr : rule.conditionDescriptionEn}</span>
                </div>

                <div className="mt-2 p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-purple-900 leading-relaxed">
                  <span className="font-bold text-purple-700 block mb-1">
                    THEN (النتيجة والتوصية):
                  </span>
                  <span>
                    {language === 'ar' ? `الحالة: ${rule.consequenceStatus}` : `Status: ${rule.consequenceStatus}`}
                  </span>
                  <ul className="mt-1 list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {(language === 'ar' ? rule.recommendationsAr : rule.recommendationsEn).slice(0, 2).map((rec, rIdx) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BATCH EVALUATION FOR ALL STUDENTS */}
      {activeTab === 'batch' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'التقرير الشامل لمحرك الاستدلال لجميع الطلاب' : 'Batch Evaluation Report'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تشغيل الاستدلال الأمامي على جميع الطلاب المقيدين في قاعدة البيانات'
                  : 'Forward chaining batch processing for all students in database'}
              </p>
            </div>
            <button
              onClick={() => {
                const results = evaluateAllStudents();
                logOperation(
                  'تشغيل الاستدلال الشامل',
                  'EXPERT_SYSTEM',
                  `تم فحص جميع الطلاب (${results.length}) عبر محرك الاستدلال وقواعد الحرمان.`,
                  `Evaluated all students (${results.length}) with forward chaining.`
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              {language === 'ar' ? 'تحديث الفحص الشامل' : 'Refresh All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'ID'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'اسم الطالب' : 'Name'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الحضور' : 'Att %'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المعدل' : 'GPA'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'مستوى الخطورة' : 'Risk'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'القواعد المفعلة' : 'Fired Rules'}</th>
                  <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'فحص فردي' : 'Inspect'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluateAllStudents().map((res) => {
                  const badge = riskBadges[res.riskLevel];

                  return (
                    <tr key={res.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {res.workingMemory.student.studentId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {language === 'ar' ? res.studentNameAr : res.studentNameEn}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {res.workingMemory.overallAttendanceRate}%
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {res.workingMemory.student.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${badge.class}`}>
                          {language === 'ar' ? badge.labelAr : badge.labelEn}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {res.firedRules.length === 0 ? (
                            <span className="text-slate-400 text-[11px]">-</span>
                          ) : (
                            res.firedRules.map((r) => (
                              <span
                                key={r.code}
                                className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[10px] font-mono font-bold"
                              >
                                {r.code}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setSelectedStudentId(res.studentId);
                            setActiveTab('inference');
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          {language === 'ar' ? 'عرض التعليل' : 'View Trace'}
                        </button>
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
