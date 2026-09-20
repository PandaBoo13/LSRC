// ============================================
// ImportQuestionsModal.tsx - Modal Import câu hỏi từ Excel
// ============================================
import React, { useState, useRef } from 'react';
import {
  FaUpload,
  FaFileExcel,
  FaDownload,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from 'react-icons/fa';
import type { Question } from '../../../../service/quiz/quiz.types';
import {
  importQuestionsFromExcel,
  downloadAndSaveImportTemplate,
} from '../../../../service/quiz/quizService';
import type { QuestionImportResponse } from '../../../../service/quiz/quiz.types';

interface ImportQuestionsModalProps {
  courseId: number;
  lessonId?: number | null;
  lessonTitle?: string;
  onClose: () => void;
  onSuccess?: (result: QuestionImportResponse) => void;
}

const QUESTION_TYPES: { value: Question['questionType']; label: string }[] = [
  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án' },
  { value: 'TRUE_FALSE', label: 'Đúng / Sai' },
  { value: 'SHORT_ANSWER', label: 'Trả lời ngắn' },
];

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [defaultType, setDefaultType] = useState<Question['questionType']>('SINGLE_CHOICE');
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<QuestionImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== HANDLERS ====================

  const validateFile = (f: File): boolean => {
    const lower = f.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      setError('Chỉ chấp nhận file .xlsx hoặc .xls');
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File không được vượt quá 10MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadAndSaveImportTemplate('question_import_template.xlsx');
    } catch (err: any) {
      setError(err?.message || 'Không tải được file mẫu');
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const res = await importQuestionsFromExcel({
        file,
        courseId,
        lessonId: lessonId ?? undefined,
        defaultQuestionType: defaultType,
      });

      setResult(res);

      // Nếu import 100% thành công → thông báo và callback
      if (res.failedCount === 0 && res.successCount > 0) {
        onSuccess?.(res);
      }
    } catch (err: any) {
      console.error('Lỗi import:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Import thất bại, vui lòng thử lại'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (importing) return;
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==================== RENDER ====================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#49BBBD]/10 flex items-center justify-center">
              <FaFileExcel className="text-[#49BBBD]" size={14} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Import câu hỏi từ Excel
              </h3>
              {lessonTitle && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bài học: <span className="font-semibold">{lessonTitle}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {/* Step 1: Tải file mẫu */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 mb-1">
                Tải file Excel mẫu (nếu chưa có)
              </p>
              <p className="text-[11px] text-slate-500 mb-2">
                File mẫu có sẵn header và 4 ví dụ cho từng loại câu hỏi.
              </p>
              <button
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-50 disabled:opacity-50 transition-colors"
              >
                {downloading ? (
                  <>
                    <FaSpinner className="animate-spin" size={10} />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <FaDownload size={10} />
                    Tải file mẫu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Chọn loại mặc định */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 mb-1">
                Loại câu hỏi mặc định
              </p>
              <p className="text-[11px] text-slate-500 mb-2">
                Dùng khi cột "Loại câu hỏi" trong file Excel bị bỏ trống.
              </p>
              <select
                value={defaultType}
                onChange={(e) => setDefaultType(e.target.value as Question['questionType'])}
                disabled={importing}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 transition-all"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Upload file */}
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 mb-1">
                Chọn file Excel đã điền
              </p>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !importing && fileInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#49BBBD] bg-[#49BBBD]/5'
                    : file
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-[#49BBBD] hover:bg-slate-50'
                } ${importing ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={importing}
                />

                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaFileExcel className="text-emerald-600" size={20} />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {!importing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className="ml-2 text-slate-400 hover:text-rose-500"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <FaUpload className="mx-auto text-slate-400 mb-2" size={20} />
                    <p className="text-xs font-semibold text-slate-600">
                      Kéo file vào đây hoặc click để chọn
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Hỗ trợ .xlsx, .xls — tối đa 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <FaExclamationTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              {/* Summary */}
              <div
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  result.failedCount === 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                {result.failedCount === 0 ? (
                  <FaCheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
                ) : (
                  <FaExclamationTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {result.failedCount === 0
                      ? 'Import thành công!'
                      : 'Import hoàn tất (có lỗi)'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <span className="text-emerald-700 font-bold">
                      {result.successCount}
                    </span>{' '}
                    thành công
                    {result.failedCount > 0 && (
                      <>
                        {' / '}
                        <span className="text-rose-700 font-bold">
                          {result.failedCount}
                        </span>{' '}
                        lỗi
                      </>
                    )}{' '}
                    — tổng {result.totalRows} row
                  </p>
                </div>
              </div>

              {/* Error table */}
              {result.errors.length > 0 && (
                <div className="border border-rose-100 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-rose-50 border-b border-rose-100">
                    <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                      Chi tiết lỗi ({result.errors.length})
                    </p>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold text-slate-600 w-16">
                            Row
                          </th>
                          <th className="px-3 py-2 text-left font-bold text-slate-600">
                            Lỗi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((e, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-3 py-2 font-mono text-rose-600 font-bold">
                              #{e.rowNumber}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{e.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <div className="text-[10px] text-slate-400">
            {file ? `Đã chọn: ${file.name}` : 'Chưa chọn file'}
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={handleReset}
                disabled={importing}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                Chọn file khác
              </button>
            )}
            <button
              onClick={handleClose}
              disabled={importing}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors"
            >
              {result && result.failedCount === 0 ? 'Đóng' : 'Hủy'}
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#49BBBD] text-white rounded-lg text-xs font-bold hover:bg-[#3da8aa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? (
                <>
                  <FaSpinner className="animate-spin" size={11} />
                  Đang import...
                </>
              ) : (
                <>
                  <FaUpload size={11} />
                  Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};