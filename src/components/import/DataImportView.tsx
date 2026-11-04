import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Save,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Student } from '../../types';

interface ParsedImportRow {
  studentId: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  departmentCode: string;
  level: number;
  gpa: number;
  status: 'valid' | 'duplicate' | 'error';
  errorMessage?: string;
}

export const DataImportView: React.FC = () => {
  const { students, departments, courses, addStudent, language, logOperation } = useApp();

  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; valid: number; duplicates: number; errors: number } | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sample CSV generator for university testing
  const sampleCsvContent = `studentId,nationalId,nameAr,nameEn,email,phone,departmentCode,level,gpa
202410110,30401010109911,كريم أسامة عبد الفتاح,Karim Osama Abdel-Fattah,karim.osama@hitu.edu.eg,01012341234,IT,1,3.45
202410111,30402020208822,سالي محمود الديب,Sally Mahmoud El-Deeb,sally.mahmoud@hitu.edu.eg,01123452345,MT,2,3.10
202410103,30305140102938,أحمد طارق محمود (مكرر),Ahmed Tarek (Duplicate),ahmed.tarek@hitu.edu.eg,01019283746,IT,3,1.92
202410112,30403030307733,زياد مصطفى سالم,Ziad Mostafa Salem,ziad.mostafa@hitu.edu.eg,01234563456,AT,1,2.80`;

  const handleLoadSample = () => {
    setCsvRawText(sampleCsvContent);
    parseAndValidate(sampleCsvContent);
  };

  const parseAndValidate = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedRows([]);
      setImportSummary(null);
      return;
    }

    const rows: ParsedImportRow[] = [];
    let validCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const studentId = cols[0] || '';
      const nationalId = cols[1] || '';
      const nameAr = cols[2] || '';
      const nameEn = cols[3] || nameAr;
      const email = cols[4] || `${studentId}@hitu.edu.eg`;
      const phone = cols[5] || '';
      const deptCode = cols[6] || 'IT';
      const level = parseInt(cols[7] || '1', 10);
      const gpa = parseFloat(cols[8] || '3.0');

      let status: ParsedImportRow['status'] = 'valid';
      let errorMsg = '';

      if (!studentId || !nameAr) {
        status = 'error';
        errorMsg = 'الرقم الجامعي والاسم مطلوبان';
        errorCount++;
      } else if (students.some((s) => s.studentId === studentId)) {
        status = 'duplicate';
        errorMsg = 'الرقم الجامعي مسجل مسبقاً في قاعدة بيانات الجامعة (تكرار)';
        duplicateCount++;
      } else if (!departments.some((d) => d.code.toUpperCase() === deptCode.toUpperCase())) {
        status = 'error';
        errorMsg = `كود القسم [${deptCode}] غير مسجل في هيكل أقسام HITU`;
        errorCount++;
      } else {
        validCount++;
      }

      rows.push({
        studentId,
        nationalId,
        nameAr,
        nameEn,
        email,
        phone,
        departmentCode: deptCode,
        level: isNaN(level) ? 1 : level,
        gpa: isNaN(gpa) ? 3.0 : gpa,
        status,
        errorMessage: errorMsg,
      });
    }

    setParsedRows(rows);
    setImportSummary({
      total: rows.length,
      valid: validCount,
      duplicates: duplicateCount,
      errors: errorCount,
    });
    setIsSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      parseAndValidate(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) return;

    for (const r of validRows) {
      const dept = departments.find((d) => d.code.toUpperCase() === r.departmentCode.toUpperCase()) || departments[0];
      const deptCourses = courses.filter((c) => c.departmentId === dept.id);

      addStudent({
        studentId: r.studentId,
        nationalId: r.nationalId || `3040101010${Math.floor(1000 + Math.random() * 9000)}`,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        email: r.email,
        phone: r.phone || '01000000000',
        departmentId: dept.id,
        academicLevel: r.level,
        gpa: r.gpa,
        registeredCourseIds: deptCourses.length > 0 ? deptCourses.map((c) => c.id) : [courses[0]?.id || ''],
        status: 'active',
        advisorId: 'doc-1',
        enrolledYear: 2024,
      });
    }

    logOperation(
      'استيراد بيانات طلاب رسمية من ملف',
      'IMPORT',
      `تم استيراد وحفظ (${validRows.length}) طالب بنجاح في قاعدة بيانات جامعة حلوان التكنولوجية بعد التدقيق والتحقق.`,
      `Imported and persisted (${validRows.length}) verified student records.`
    );

    setIsSuccess(true);
    setParsedRows([]);
    setImportSummary(null);
    setCsvRawText('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'ar' ? 'بوابة استيراد البيانات الجامعية الرسمية (Excel / CSV)' : 'Official Data Import Gateway'}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            HITU Importer
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'ar'
            ? 'نظام استيراد وتدقيق البيانات الرسمية لجامعة حلوان التكنولوجية الدولية مع فحص التكرار وصحة الأرقام الجامعية.'
            : 'Pre-flight data validation, duplicate ID detection, and automated enrollment import engine.'}
        </p>
      </div>

      {/* Main Upload / Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>{language === 'ar' ? 'رفع ملف البيانات أو لصق النص (CSV format)' : 'Upload CSV / Paste Records'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'الحقول المطلوبة: الرقم الجامعي، الرقم القومي، الاسم، البريد، كود القسم، المستوى، المعدل.'
                : 'Expected columns: studentId, nationalId, nameAr, nameEn, email, phone, departmentCode, level, gpa'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'تحميل نموذج تجريبي للاختبار' : 'Load Demo Sample'}</span>
            </button>

            <label className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'اختيار ملف من جهازك' : 'Choose CSV File'}</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Text Area Input */}
        <div>
          <textarea
            rows={5}
            value={csvRawText}
            onChange={(e) => {
              setCsvRawText(e.target.value);
              parseAndValidate(e.target.value);
            }}
            placeholder={sampleCsvContent}
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Validation Summary Report */}
      {importSummary && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'تقرير فحص وتدقيق البيانات قبل الحفظ:' : 'Pre-import Validation Report:'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تم فحص السجلات والتحقق من عدم وجود أرقام جامعية مكررة ومطابقة الأقسام التكنولوجية.'
                  : 'Duplicate IDs and department existence verified.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                {importSummary.valid} {language === 'ar' ? 'سليم جاهز' : 'valid'}
              </span>
              {importSummary.duplicates > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold">
                  {importSummary.duplicates} {language === 'ar' ? 'مكرر' : 'duplicates'}
                </span>
              )}
              {importSummary.errors > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold">
                  {importSummary.errors} {language === 'ar' ? 'أخطاء' : 'errors'}
                </span>
              )}
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'الرقم الجامعي' : 'ID'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'القسم' : 'Dept'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'المستوى' : 'Level'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'المعدل' : 'GPA'}</th>
                  <th className="py-2 px-3 text-start">{language === 'ar' ? 'ملاحظة التدقيق' : 'Note'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className={row.status === 'valid' ? 'bg-white' : 'bg-red-50/40'}>
                    <td className="py-2 px-3">
                      {row.status === 'valid' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'سليم' : 'Valid'}</span>
                        </span>
                      )}
                      {row.status === 'duplicate' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'مكرر' : 'Duplicate'}</span>
                        </span>
                      )}
                      {row.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'خطأ' : 'Error'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.studentId}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{row.nameAr}</td>
                    <td className="py-2 px-3 font-medium text-slate-700">{row.departmentCode}</td>
                    <td className="py-2 px-3 text-slate-700">{row.level}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.gpa.toFixed(2)}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">
                      {row.errorMessage || (language === 'ar' ? 'جاهز للحفظ' : 'Ready')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action to persist */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleConfirmImport}
              disabled={importSummary.valid === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>
                {language === 'ar'
                  ? `تأكيد واعتماد استيراد (${importSummary.valid}) طالب إلى قاعدة البيانات`
                  : `Confirm Import (${importSummary.valid}) Students`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>
            {language === 'ar'
              ? 'تم استيراد وحفظ سجلات الطلاب بنجاح في قاعدة بيانات جامعة حلوان التكنولوجية، وأصبحت متاحة فوراً في نظام الحضور والنظام الخبير!'
              : 'Students imported successfully into database and are immediately active in attendance & expert system.'}
          </span>
        </div>
      )}
    </div>
  );
};
