import { ProductionRule } from '../types';

/**
 * Default Production Rules for UniWise – HITU
 * Formatted as formal Expert System Production Rules: IF [Conditions] THEN [Consequence]
 * Grounded in Egyptian Technological Universities Council Bylaws & Regulations
 */
export const DEFAULT_PRODUCTION_RULES: ProductionRule[] = [
  {
    id: 'rule-att-01',
    code: 'RULE-ATT-01',
    nameAr: 'حرمان أكاديمي لتجاوز الحد الأقصى للغياب (25%)',
    nameEn: 'Official Exam Deprivation (Exceeded 25% Absence)',
    category: 'attendance_deprivation',
    conditionDescriptionAr: 'إذا تجاوزت نسبة غياب الطالب في أي مقرر 25% من مجموع المحاضرات الفعلية',
    conditionDescriptionEn: 'IF absence rate in any registered course exceeds or equals 25%',
    conditions: [
      {
        field: 'course_attendance_rate',
        operator: '<=',
        value: 75.0, // attendance <= 75% means absence >= 25%
        courseSpecific: true,
      },
    ],
    consequenceStatus: 'deprivation_risk',
    riskLevel: 'critical',
    recommendationsAr: [
      'إصدار قرار حرمان رسمي معتمد من مجلس الكلية من دخول الامتحان النهائي للمقرر.',
      'إخطار شؤون الطلاب وولي أمر الطالب فوراً عبر المنصة الجامعية الرسمية.',
      'تسجيل درجة الحرمان (FA) في السجل الأكاديمي إذا لم يُقبل عذر قهري معتمد.',
    ],
    recommendationsEn: [
      'Issue an official Dean Council decree barring the student from the course final exam.',
      'Promptly notify Student Affairs and the guardian via the official HITU portal.',
      'Record an administrative failure due to absence (FA) unless an approved official excuse is validated.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 100,
    version: '1.2.0',
  },
  {
    id: 'rule-att-02',
    code: 'RULE-ATT-02',
    nameAr: 'إنذار غياب ثانٍ واستدعاء ولي الأمر (15% غياب)',
    nameEn: 'Second Absence Warning & Academic Counseling Summon (15% Absence)',
    category: 'early_warning',
    conditionDescriptionAr: 'إذا بلغت نسبة الغياب بين 15% وأقل من 25% في أي مقرر',
    conditionDescriptionEn: 'IF absence rate in any registered course is between 15% and 24.9%',
    conditions: [
      {
        field: 'course_attendance_rate',
        operator: '<=',
        value: 85.0, // absence >= 15%
        courseSpecific: true,
      },
      {
        field: 'course_attendance_rate',
        operator: '>',
        value: 75.0, // absence < 25%
        courseSpecific: true,
      },
    ],
    consequenceStatus: 'attendance_warning',
    riskLevel: 'high',
    recommendationsAr: [
      'توجيه إنذار رسمي ثانٍ وتوقيع الطالب على تعهد خطي بالحضور المنتظم.',
      'جلسة عاجلة مع المرشد الأكاديمي لبحث أسباب الغياب المتكرر.',
      'إشعار أستاذ المادة بتشديد متابعة الحضور الميداني والمعملي.',
    ],
    recommendationsEn: [
      'Serve an official 2nd written attendance warning and request student commitment signing.',
      'Mandatory session with academic counselor to investigate repeated absence reasons.',
      'Alert course professor to monitor lab and practical attendance strictly.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 85,
    version: '1.2.0',
  },
  {
    id: 'rule-att-03',
    code: 'RULE-ATT-03',
    nameAr: 'إنذار غياب أول استباقي (10% غياب)',
    nameEn: 'First Early Attendance Warning (10% Absence)',
    category: 'early_warning',
    conditionDescriptionAr: 'إذا بلغت نسبة الغياب بين 10% وأقل من 15% في أي مقرر',
    conditionDescriptionEn: 'IF absence rate in any registered course is between 10% and 14.9%',
    conditions: [
      {
        field: 'course_attendance_rate',
        operator: '<=',
        value: 90.0, // absence >= 10%
        courseSpecific: true,
      },
      {
        field: 'course_attendance_rate',
        operator: '>',
        value: 85.0, // absence < 15%
        courseSpecific: true,
      },
    ],
    consequenceStatus: 'early_warning',
    riskLevel: 'moderate',
    recommendationsAr: [
      'إرسال إشعار تنبيه إلكتروني عبر حساب الطالب ببلوغ نسبة الغياب 10%.',
      'تذكير الطالب بلائحة الحضور المعتمدة في جامعة حلوان التكنولوجية الدولية.',
    ],
    recommendationsEn: [
      'Send an automated portal alert notifying the student of reaching 10% absence.',
      'Remind the student of HITU technological academic bylaws regarding minimum attendance.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 60,
    version: '1.2.0',
  },
  {
    id: 'rule-exp-01',
    code: 'RULE-EXP-01',
    nameAr: 'خطر تعثر مركب (تزامن انخفاض الحضور مع تدني المعدل التراكمي)',
    nameEn: 'Compound Academic Risk (High Absence combined with Low GPA < 2.00)',
    category: 'academic_risk',
    conditionDescriptionAr: 'إذا كان معدل الطالب التراكمي أقل من 2.00 ونسبة الحضور الإجمالية أقل من 85%',
    conditionDescriptionEn: 'IF Student GPA < 2.00 AND Overall Attendance Rate <= 85%',
    conditions: [
      {
        field: 'gpa',
        operator: '<',
        value: 2.0,
      },
      {
        field: 'overall_attendance_rate',
        operator: '<=',
        value: 85.0,
      },
    ],
    consequenceStatus: 'academic_probation',
    riskLevel: 'high',
    recommendationsAr: [
      'وضع الطالب تحت الملاحظة الأكاديمية المشددة للمتعثرين.',
      'تخفيض الحد الأقصى للساعات المسجلة في الفصل القادم إلى 12 ساعة معتمدة.',
      'إلزام الطالب بحضور حصص الدعم الأكاديمي والتقني التكميلية في الكلية.',
      'متابعة أسبوعية مشتركة بين المرشد الأكاديمي ورؤساء الأقسام التكنولوجية.',
    ],
    recommendationsEn: [
      'Place student under intensive academic probation protocol.',
      'Cap next semester registration load to a maximum of 12 credit hours.',
      'Mandate attendance at remedial technological tutorials and workshops.',
      'Schedule weekly check-ins with academic counselor and program coordinator.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 95,
    version: '1.2.0',
  },
  {
    id: 'rule-exp-02',
    code: 'RULE-EXP-02',
    nameAr: 'خطر الرسوب في أعمال الفصل والميدتيرم مع الغياب',
    nameEn: 'Midterm Failure and Course Absence Dual Vulnerability',
    category: 'academic_risk',
    conditionDescriptionAr: 'إذا كانت درجة الميدتيرم أقل من 50% (أقل من 10/20) مع نسبة غياب في المادة تزيد عن 15%',
    conditionDescriptionEn: 'IF Midterm Score < 10/20 AND Course Attendance <= 85%',
    conditions: [
      {
        field: 'midterm_score',
        operator: '<',
        value: 10.0, // out of 20
        courseSpecific: true,
      },
      {
        field: 'course_attendance_rate',
        operator: '<=',
        value: 85.0,
        courseSpecific: true,
      },
    ],
    consequenceStatus: 'needs_review',
    riskLevel: 'high',
    recommendationsAr: [
      'توجيه أستاذ المقرر لتقديم خطة تعويضية للمختبرات والتمارين التكنولوجية.',
      'إجراء اختبار تقييمي تدريبي لتحسين درجات أعمال السنة قبل الاختبار النهائي.',
      'إلزام الطالب بمراجعة الهيئة المعاونة في الساعات المكتبية.',
    ],
    recommendationsEn: [
      'Request course instructor to offer compensatory lab tasks and practical sessions.',
      'Administer a formative remediation quiz to boost continuous assessment points.',
      'Require mandatory attendance in teaching assistants office hours.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 80,
    version: '1.2.0',
  },
  {
    id: 'rule-exp-03',
    code: 'RULE-EXP-03',
    nameAr: 'انقطاع متتالي عن المحاضرات (3 محاضرات متتالية)',
    nameEn: 'Consecutive Unexcused Absence Pattern (>= 3 consecutive sessions)',
    category: 'intervention',
    conditionDescriptionAr: 'إذا تغيب الطالب عن 3 محاضرات متتالية أو أكثر في نفس المقرر دون عذر رسمي',
    conditionDescriptionEn: 'IF student is absent for 3 or more consecutive lectures in the same course',
    conditions: [
      {
        field: 'consecutive_absences',
        operator: '>=',
        value: 3,
        courseSpecific: true,
      },
    ],
    consequenceStatus: 'needs_review',
    riskLevel: 'moderate',
    recommendationsAr: [
      'التواصل الفوري من قسم رعاية الطلاب مع الطالب تليفونياً للتحقق من سلامته وظروفه.',
      'التأكد من عدم وجود عائق صحي أو ظرف طارئ يتطلب إيقاف قيد مؤقت وفق اللائحة.',
    ],
    recommendationsEn: [
      'Immediate phone contact by Student Care Department to verify student well-being.',
      'Check for medical or extenuating circumstances warranting semester freeze.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 70,
    version: '1.2.0',
  },
  {
    id: 'rule-exp-04',
    code: 'RULE-EXP-04',
    nameAr: 'التميز الأكاديمي والانضباط العالي (لوحة الشرف)',
    nameEn: 'Academic Excellence and Exemplary Attendance (Dean Honor Roll)',
    category: 'excellence',
    conditionDescriptionAr: 'إذا كان المعدل التراكمي 3.60 فأعلى ونسبة الحضور العامة 95% فأعلى دون أي رسوب',
    conditionDescriptionEn: 'IF GPA >= 3.60 AND Overall Attendance Rate >= 95% AND Failed Courses == 0',
    conditions: [
      {
        field: 'gpa',
        operator: '>=',
        value: 3.6,
      },
      {
        field: 'overall_attendance_rate',
        operator: '>=',
        value: 95.0,
      },
      {
        field: 'failed_courses_count',
        operator: '==',
        value: 0,
      },
    ],
    consequenceStatus: 'honors',
    riskLevel: 'safe',
    recommendationsAr: [
      'إدراج الطالب في لوحة شرف رئيس الجامعة وعميد الكلية.',
      'ترشيح الطالب لبرامج التدريب الصيفي المتقدمة في الشركات التكنولوجية الشريكة.',
      'أولوية التسجيل الأكاديمي والسماح بزيادة العبء الدراسي إلى 21 ساعة معتمدة.',
    ],
    recommendationsEn: [
      'Nominate student to the President & Dean Academic Honors Roll.',
      'Recommend student for elite industrial summer internships with HITU corporate partners.',
      'Priority course registration with permission for an overload up to 21 credit hours.',
    ],
    approvedByUniversity: true,
    active: true,
    priority: 50,
    version: '1.2.0',
  },
];
