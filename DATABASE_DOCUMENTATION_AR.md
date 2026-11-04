# توثيق قاعدة البيانات المركزية والعلاقات المترابطة (Database Documentation)
## منصة UniWise – HITU
### جامعة حلوان التكنولوجية الدولية (Helwan Int'l Technological University)

---

## 1. مخطط الكيانات والعلاقات (Entity Relationship Overview)

تعتمد المنصة على نموذج قاعدة بيانات علائقية مركزية تتضمن 11 جدولاً متكاملاً:

```
[Departments] 1 ------- N [Courses] 1 ------- N [LectureSessions]
      |                        |                         |
      | 1                      | M                       | 1
      |                        |                         |
      N                        N                         N
  [Students] <=========> [Enrollments]            [AttendanceRecords]
      |                        |                         |
      | 1                      | 1                       |
      |                        |                         |
      N                        N                         |
[GradeRecords]            [InferenceResults] <-----------+
                               |
                               |
                        [ProductionRules]
```

---

## 2. تفاصيل الجداول والسمات والقيود (Tables & Constraints)

### 1. جدول الأقسام التكنولوجية (`departments`)
- `id` (PK, VARCHAR): معرف القسم التكنولوجي الفريد (مثال: `dept-it`).
- `code` (VARCHAR, UNIQUE): كود القسم (مثال: `IT`, `MT`, `AT`, `HT`).
- `nameAr` (VARCHAR): الاسم الرسمي بالعربية (مثال: قسم تكنولوجيا المعلومات والذكاء الاصطناعي).
- `nameEn` (VARCHAR): الاسم الرسمي بالإنجليزية.
- `headOfDepartmentAr` (VARCHAR): رئيس القسم التكنولوجي.
- `establishedYear` (INT): سنة التأسيس.

### 2. جدول المقررات الدراسية (`courses`)
- `id` (PK, VARCHAR): المعرف الفريد للمقرر (مثال: `course-it301`).
- `code` (VARCHAR, UNIQUE): كود المقرر (مثال: `IT-301`).
- `nameAr` (VARCHAR): اسم المقرر بالعربية.
- `departmentId` (FK -> `departments.id`): القسم التابع له المقرر.
- `creditHours` (INT): عدد الساعات المعتمدة للمقرر (مثال: 3).
- `doctorId` (FK -> `doctors.id`): أستاذ المادة المسؤول.
- `maxAbsencePercent` (FLOAT): الحد الأقصى اللائحي للغياب (افتراضياً 25.0%).

### 3. جدول الطلاب (`students`)
- `id` (PK, VARCHAR): معرف الطالب البرمجي الفريد.
- `studentId` (VARCHAR, UNIQUE): الرقم الجامعي الرسمي للطالب في جامعة حلوان (مثال: `202410103`).
- `nationalId` (VARCHAR, UNIQUE): الرقم القومي (14 رقماً).
- `nameAr` (VARCHAR): الاسم الرباعي بالعربية.
- `nameEn` (VARCHAR): الاسم بالإنجليزية.
- `email` (VARCHAR, UNIQUE): البريد الجامعي الرسمي (@hitu.edu.eg).
- `phone` (VARCHAR): رقم الهاتف للتواصل ولجان الإرشاد.
- `departmentId` (FK -> `departments.id`): القسم التكنولوجي المقيد به.
- `academicLevel` (INT): المستوى الدراسي (1, 2, 3, 4).
- `gpa` (FLOAT): المعدل التراكمي (0.00 إلى 4.00).
- `status` (VARCHAR): الحالة الأكاديمية (active, deprivation_risk, attendance_warning, honors).

### 4. جدول جلسات المحاضرات والمعامل (`lecture_sessions`)
- `id` (PK, VARCHAR): معرف جلسة المحاضرة.
- `courseId` (FK -> `courses.id`): المقرر المنعقد له الجلسة.
- `doctorId` (FK -> `doctors.id`): المحاضر.
- `date` (DATE): تاريخ انعقاد المحاضرة.
- `timeSlot` (VARCHAR): الفترة الزمنية (مثال: 09:00 - 11:00).
- `hall` (VARCHAR): المدرج أو المعمل التكنولوجي.
- `weekNumber` (INT): رقم الأسبوع في الفصل الدراسي (1 إلى 16).
- `presentCount` (INT), `absentCount` (INT), `lateCount` (INT), `excusedCount` (INT).

### 5. جدول سجلات الحضور والغياب التفصيلية (`attendance_records`)
- `id` (PK, VARCHAR): معرف قيد الحضور.
- `sessionId` (FK -> `lecture_sessions.id`): جلسة المحاضرة.
- `studentId` (FK -> `students.id`): الطالب.
- `courseId` (FK -> `courses.id`): المقرر.
- `date` (DATE): تاريخ التسجيل.
- `status` (ENUM): حالة الحضور (`present`, `absent`, `late`, `excused`).
- `notes` (TEXT): ملاحظات الأستاذ (مثال: تأخير بعذر، تغيب بدون إذن).
- `recordedBy` (FK -> `users.id`): معرف مسجل الحضور.

### 6. جدول درجات الطلاب (`grade_records`)
- `id` (PK, VARCHAR): معرف قيد الدرجات.
- `studentId` (FK -> `students.id`): الطالب.
- `courseId` (FK -> `courses.id`): المقرر.
- `semester` (VARCHAR): الفصل الدراسي.
- `courseworkScore` (FLOAT, max: 20): أعمال السنة.
- `midtermScore` (FLOAT, max: 20): اختبار الميدتيرم.
- `practicalScore` (FLOAT, max: 20): العملي والتطبيقي.
- `finalScore` (FLOAT, max: 40): الاختبار النهائي.
- `totalScore` (FLOAT, max: 100): المجموع الكلي.
- `letterGrade` (VARCHAR): التقدير (A+, A, B+, B, C+, C, D+, D, F).
- `gpaPoints` (FLOAT): النقاط من 4.0.

### 7. جدول قواعد الإنتاج بالنظام الخبير (`production_rules`)
- `id` (PK, VARCHAR): معرف القاعدة الفريد.
- `code` (VARCHAR, UNIQUE): كود القاعدة (مثال: `RULE-ATT-01`).
- `nameAr` (VARCHAR): اسم القاعدة بالعربية.
- `category` (VARCHAR): التصنيف (attendance_deprivation, academic_risk, early_warning, excellence).
- `conditions` (JSON): مصفوفة الشروط والمعاملات المقارنة (operator, threshold, field).
- `consequenceStatus` (VARCHAR): الحالة المستنتجة.
- `riskLevel` (ENUM): مستوى الخطورة (critical, high, moderate, low, safe).
- `priority` (INT): أولوية القاعدة في حل التعارض (Conflict Resolution).
- `active` (BOOLEAN): حالة التفعيل في محرك الاستدلال.

### 8. جدول سجل العمليات والتدقيق الأمني (`audit_logs`)
- `id` (PK, VARCHAR): معرف سجل العملية.
- `timestamp` (TIMESTAMP): التوقيت الدقيق.
- `userId` (FK -> `users.id`): المستخدم المنفذ.
- `module` (VARCHAR): الوحدة (ATTENDANCE, GRADES, EXPERT_SYSTEM, STUDENTS, IMPORT).
- `action` (VARCHAR): العملية المنجزة.
- `detailsAr` (TEXT): التفاصيل الكاملة لحماية البيانات ومراجعة الأنشطة الحساسة.
