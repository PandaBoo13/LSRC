// src/components/elearning/user/UserExcelImportTab.tsx
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FaCloudUploadAlt, 
  FaFileExcel, 
  FaDownload, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaSync, 
  FaTrashAlt, 
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa';

// ✅ Sửa import
import { importStudents } from '../../../service/userService';

export interface UserExcelImportTabProps {
  onSuccess?: () => void | Promise<void>;
}

interface ColumnStatus {
  value: string;
  valid: boolean;
  error?: string;
}

interface PreviewUser {
  stt: number;
  firstName: ColumnStatus;
  lastName: ColumnStatus;
  email: ColumnStatus;
  phone: ColumnStatus;
  dob: ColumnStatus;
  gender: ColumnStatus;
  address: ColumnStatus;
  status: 'Valid' | 'Invalid';
  errorMsg?: string;
}

export function UserExcelImportTab({ onSuccess }: UserExcelImportTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<PreviewUser[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const excelSerialToDate = (serial: number): string | null => {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    if (serial >= 60) {
      date.setDate(date.getDate() - 1);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCellValueAsString = (rowObj: Record<string, any>, targetKey: string): string => {
    const foundKey = Object.keys(rowObj).find(
      (k) => k.trim().toLowerCase() === targetKey.toLowerCase()
    );
    if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
      const rawValue = rowObj[foundKey];

      if (rawValue instanceof Date) {
        const year = rawValue.getFullYear();
        const month = String(rawValue.getMonth() + 1).padStart(2, '0');
        const day = String(rawValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      if (typeof rawValue === 'number') {
        if (targetKey.toLowerCase() === 'dob' && rawValue > 10000 && rawValue < 100000) {
          const dateStr = excelSerialToDate(rawValue);
          if (dateStr) return dateStr;
        }
        return String(rawValue);
      }
      return String(rawValue).trim();
    }
    return '';
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        firstName: 'Nguyễn',
        lastName: 'Văn An',
        email: 'nguyenvana@email.com',
        phone: '0912345678',
        dob: '2000-01-15',
        gender: 'male',
        address: 'Hà Nội'
      },
      {
        firstName: 'Trần',
        lastName: 'Thị Bình',
        email: 'tranthib@company.vn',
        phone: '0987654321',
        dob: '1999-05-20',
        gender: 'female',
        address: 'TP.HCM'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UserTemplate');
    XLSX.writeFile(workbook, 'Danh_Sach_Nguoi_Dung_Mau.xlsx');
  };

  const validateColumn = (
    columnName: string,
    value: string,
    isDuplicateEmail = false
  ): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const validGenders = ['male', 'female', 'other'];

    switch (columnName) {
      case 'firstName':
      case 'lastName':
        if (!value) return { valid: false, error: 'Thiếu' };
        if (value.length > 50) return { valid: false, error: '>50 ký tự' };
        return { valid: true };
      case 'email':
        if (!value) return { valid: false, error: 'Thiếu' };
        if (!emailRegex.test(value)) return { valid: false, error: 'Sai định dạng' };
        if (isDuplicateEmail) return { valid: false, error: 'Email trùng lặp trong file' };
        return { valid: true };
      case 'phone':
        if (!value) return { valid: true };
        if (!phoneRegex.test(value)) return { valid: false, error: 'Sai (8-15 số)' };
        return { valid: true };
      case 'dob':
        if (!value) return { valid: true };
        if (!dateRegex.test(value)) return { valid: false, error: 'Sai (YYYY-MM-DD)' };
        return { valid: true };
      case 'gender':
        if (!value) return { valid: true };
        if (!validGenders.includes(value)) return { valid: false, error: 'Chỉ male/female/other' };
        return { valid: true };
      case 'address':
        if (!value) return { valid: true };
        if (value.length > 500) return { valid: false, error: '>500 ký tự' };
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isExtensionValid = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!isExtensionValid) {
      alert('Vui lòng chọn file Excel (.xlsx, .xls) hoặc .csv hợp lệ!');
      return;
    }

    setFile(selectedFile);
    setApiError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          alert('File Excel rỗng hoặc không có dữ liệu hợp lệ!');
          return;
        }

        const parsedPreview: PreviewUser[] = [];
        const errList: string[] = [];

        const emailCounts: Record<string, number> = {};
        rawRows.forEach((row) => {
          const email = getCellValueAsString(row, 'email').toLowerCase();
          if (email) {
            emailCounts[email] = (emailCounts[email] || 0) + 1;
          }
        });

        rawRows.forEach((row, index) => {
          const hasData = Object.values(row).some(val => String(val).trim() !== '');
          if (!hasData) return;

          const rawFirstName = getCellValueAsString(row, 'firstName');
          const rawLastName = getCellValueAsString(row, 'lastName');
          const rawEmail = getCellValueAsString(row, 'email').toLowerCase();
          const rawPhone = getCellValueAsString(row, 'phone');
          const rawDob = getCellValueAsString(row, 'dob');
          const rawGender = getCellValueAsString(row, 'gender').toLowerCase();
          const rawAddress = getCellValueAsString(row, 'address');

          const isDupEmail = !!rawEmail && emailCounts[rawEmail] > 1;

          const firstNameStatus = { value: rawFirstName, ...validateColumn('firstName', rawFirstName) };
          const lastNameStatus = { value: rawLastName, ...validateColumn('lastName', rawLastName) };
          const emailStatus = { value: rawEmail, ...validateColumn('email', rawEmail, isDupEmail) };
          const phoneStatus = { value: rawPhone, ...validateColumn('phone', rawPhone) };
          const dobStatus = { value: rawDob, ...validateColumn('dob', rawDob) };
          const genderStatus = { value: rawGender, ...validateColumn('gender', rawGender) };
          const addressStatus = { value: rawAddress, ...validateColumn('address', rawAddress) };

          const allColumns = [firstNameStatus, lastNameStatus, emailStatus, phoneStatus, dobStatus, genderStatus, addressStatus];
          const failedColumns = allColumns.filter(c => !c.valid);
          
          const isValid = failedColumns.length === 0;
          const errorMsg = failedColumns.map(c => c.error).join('; ');

          const sttUI = parsedPreview.length + 1;

          if (!isValid) {
            errList.push(`Dòng ${index + 2}: ${errorMsg}`);
          }

          parsedPreview.push({
            stt: sttUI,
            firstName: firstNameStatus,
            lastName: lastNameStatus,
            email: emailStatus,
            phone: phoneStatus,
            dob: dobStatus,
            gender: genderStatus,
            address: addressStatus,
            status: isValid ? 'Valid' : 'Invalid',
            errorMsg: errorMsg || undefined
          });
        });

        setPreviewData(parsedPreview);
        setErrors(errList);
        setUploadStatus('preview');
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        alert('File Excel bị lỗi hoặc không thể đọc được dữ liệu!');
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    setApiError(null);

    try {
      // ✅ Đổi userService.importStudents → importStudents
      await importStudents(file);
      setUploadStatus('success');
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err: any) {
      console.error('API Import Error:', err);
      setUploadStatus('error');

      const serverMessage = 
        err?.response?.data?.message || 
        err?.message || 
        'Không thể kết nối đến server hoặc có lỗi xảy ra!';

      setApiError(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setApiError(null);
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = previewData.filter(i => i.status === 'Valid').length;
  const invalidCount = previewData.filter(i => i.status === 'Invalid').length;

  const renderMobileCard = (u: PreviewUser) => (
    <div 
      key={u.stt} 
      className={`lg:hidden p-4 rounded-2xl border mb-3 ${
        u.status === 'Invalid' 
          ? 'bg-rose-50/30 border-rose-200' 
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
            {u.stt}
          </span>
          <span className="text-xs font-bold text-[#2F327D]">
            {u.firstName.value} {u.lastName.value}
          </span>
        </div>
        {u.status === 'Valid' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
            <FaCheckCircle className="text-[9px]" /> OK
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
            <FaTimesCircle className="text-[9px]" /> Lỗi
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <FieldItem label="Email" value={u.email} />
        <FieldItem label="Phone" value={u.phone} />
        <FieldItem label="DOB" value={u.dob} />
        <FieldItem label="Gender" value={u.gender} />
        <FieldItem label="Address" value={u.address} isFull />
      </div>

      {u.errorMsg && (
        <div className="mt-2 pt-2 border-t border-rose-200 text-[10px] text-rose-600 font-semibold">
          ⚠ {u.errorMsg}
        </div>
      )}
    </div>
  );

  const FieldItem = ({ label, value, isFull = false }: { label: string; value: ColumnStatus; isFull?: boolean }) => {
    const colSpan = isFull ? 'col-span-2' : '';
    if (!value.valid) {
      return (
        <div className={`${colSpan} bg-rose-100 rounded-lg p-2`}>
          <p className="text-rose-500 font-bold text-[9px] uppercase">{label}</p>
          <p className="text-rose-800 font-semibold text-[10px]">{value.value || '(Trống)'}</p>
          <p className="text-rose-600 text-[9px] font-bold">⚠ {value.error}</p>
        </div>
      );
    }
    return (
      <div className={`${colSpan}`}>
        <p className="text-slate-400 font-bold text-[9px] uppercase">{label}</p>
        <p className="text-slate-700 text-[10px]">{value.value || '(Trống)'}</p>
      </div>
    );
  };

  const renderCell = (col: ColumnStatus) => {
    if (!col.valid) {
      return (
        <td className="p-2 bg-rose-100 border border-rose-300 rounded">
          <div className="flex flex-col">
            <span className="text-rose-800 font-semibold text-[11px]">
              {col.value || '(Trống)'}
            </span>
            <span className="text-rose-600 text-[10px] font-bold mt-0.5">
              ⚠ {col.error}
            </span>
          </div>
        </td>
      );
    }

    if (!col.value) {
      return (
        <td className="p-2 text-slate-400 italic text-[11px]">
          (Trống)
        </td>
      );
    }

    return (
      <td className="p-2 text-slate-700 text-[11px]">
        {col.value.length > 20 ? col.value.substring(0, 20) + '...' : col.value}
      </td>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#2F327D]">
            Thêm người dùng từ Excel
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Tải lên danh sách tài khoản theo tên các cột quy định.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-cyan-50 text-[#49BBBD] hover:bg-cyan-100/70 text-[11px] sm:text-xs font-bold transition active:scale-[0.98] cursor-pointer w-full sm:w-auto"
        >
          <FaDownload className="text-xs sm:text-sm" /> Tải file mẫu (.XLSX)
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
        
        {/* UPLOAD ZONE */}
        {uploadStatus === 'idle' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 sm:gap-3 ${
              isDragging 
                ? 'border-[#49BBBD] bg-cyan-50/40 scale-[0.99]' 
                : 'border-slate-200 bg-slate-50/50 hover:border-[#49BBBD] hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />

            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-50 text-[#49BBBD] flex items-center justify-center text-xl sm:text-2xl shadow-2xs">
              <FaCloudUploadAlt />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#2F327D]">
                Kéo thả file Excel vào đây, hoặc{' '}
                <span className="text-[#49BBBD] underline">chọn từ máy tính</span>
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                Hỗ trợ .XLSX, .XLS, .CSV (Tối đa 10MB)
              </p>
            </div>
          </div>
        )}

        {/* PREVIEW / SUCCESS / ERROR */}
        {uploadStatus !== 'idle' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-base sm:text-lg">
                  <FaFileExcel />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-bold text-[#2F327D] truncate max-w-[150px] sm:max-w-none">
                    {file?.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {((file?.size || 0) / 1024).toFixed(1)} KB • {previewData.length} bản ghi
                  </p>
                </div>
              </div>
              {uploadStatus !== 'success' && (
                <button
                  onClick={handleReset}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg sm:rounded-xl transition cursor-pointer"
                  title="Hủy chọn file"
                >
                  <FaTrashAlt className="text-xs sm:text-sm" />
                </button>
              )}
            </div>

            {/* Success message */}
            {uploadStatus === 'success' && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 sm:gap-3 text-emerald-800 text-[11px] sm:text-xs">
                <FaCheckCircle className="text-emerald-500 text-base sm:text-lg shrink-0" />
                <div>
                  <p className="font-bold">Nhập danh sách người dùng thành công!</p>
                  <p className="text-emerald-700 mt-0.5">Dữ liệu đã được lưu vào cơ sở dữ liệu.</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {uploadStatus === 'error' && apiError && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-2 sm:gap-3 text-rose-800 text-[11px] sm:text-xs">
                <FaTimesCircle className="text-rose-500 text-sm sm:text-base shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Nhập dữ liệu thất bại từ Server</p>
                  <p className="text-rose-700 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* Warning */}
            {uploadStatus === 'preview' && errors.length > 0 && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-2 sm:gap-3 text-amber-800 text-[11px] sm:text-xs">
                <FaExclamationTriangle className="text-amber-500 text-sm sm:text-base shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cảnh báo: {invalidCount} dòng có lỗi</p>
                  <p className="text-amber-700 mt-0.5">
                    Ô <span className="bg-rose-200 px-1 rounded">đỏ</span> là dữ liệu không hợp lệ.
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase">Tổng số</p>
                <p className="text-sm sm:text-base font-bold text-[#2F327D]">{previewData.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-[9px] sm:text-[11px] font-bold text-emerald-700 uppercase">Hợp lệ</p>
                <p className="text-sm sm:text-base font-bold text-emerald-700">{validCount}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50/60 border border-rose-100">
                <p className="text-[9px] sm:text-[11px] font-bold text-rose-700 uppercase">Lỗi</p>
                <p className="text-sm sm:text-base font-bold text-rose-700">{invalidCount}</p>
              </div>
            </div>

            {/* Mobile Card view */}
            <div className="lg:hidden space-y-1">
              <p className="text-[10px] font-bold text-[#2F327D] uppercase tracking-wider">
                Danh sách ({previewData.length} bản ghi)
              </p>
              {previewData.map(u => renderMobileCard(u))}
            </div>

            {/* Desktop Table view */}
            <div className="hidden lg:block space-y-2">
              <p className="text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                Xem trước danh sách ({previewData.length} bản ghi)
              </p>
              <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-100">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-center w-10">STT</th>
                      <th className="p-2 min-w-[80px]">First Name</th>
                      <th className="p-2 min-w-[80px]">Last Name</th>
                      <th className="p-2 min-w-[140px]">Email</th>
                      <th className="p-2 min-w-[90px]">Phone</th>
                      <th className="p-2 min-w-[90px]">DOB</th>
                      <th className="p-2 min-w-[70px]">Gender</th>
                      <th className="p-2 min-w-[100px]">Address</th>
                      <th className="p-2 text-center w-20">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((u) => (
                      <tr key={u.stt} className={u.status === 'Invalid' ? 'bg-rose-50/20' : 'hover:bg-slate-50'}>
                        <td className="p-2 text-center text-slate-400 font-mono font-bold">{u.stt}</td>
                        {renderCell(u.firstName)}
                        {renderCell(u.lastName)}
                        {renderCell(u.email)}
                        {renderCell(u.phone)}
                        {renderCell(u.dob)}
                        {renderCell(u.gender)}
                        {renderCell(u.address)}
                        <td className="p-2 text-center">
                          {u.status === 'Valid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              <FaCheckCircle className="text-[9px]" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              <FaTimesCircle className="text-[9px]" /> Lỗi
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footnote */}
            {invalidCount > 0 && (
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-50/50 border border-amber-100 text-[9px] sm:text-[10px] text-amber-800">
                <span className="font-bold">Chú thích:</span>{' '}
                <span className="font-semibold">Thiếu:</span> bỏ trống |{' '}
                <span className="font-semibold">&gt;50 ký tự:</span> vượt độ dài |{' '}
                <span className="font-semibold">Sai định dạng:</span> Email/Phone/Date
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
              {uploadStatus === 'success' ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#49BBBD] text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:bg-[#3ca3a5] transition active:scale-[0.98] cursor-pointer"
                >
                  Nhập file khác
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer order-2 sm:order-1"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || validCount === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#49BBBD] hover:bg-[#3ca3a5] text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer order-1 sm:order-2"
                  >
                    {isUploading ? (
                      <>
                        <FaSync className="animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        Import ({validCount}) <FaArrowRight />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RULES FOOTER */}
      <div className="bg-cyan-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-cyan-100 flex items-start gap-2 sm:gap-3 text-[10px] sm:text-xs">
        <FaInfoCircle className="text-[#49BBBD] text-sm sm:text-base shrink-0 mt-0.5" />
        <div className="text-slate-600 space-y-1">
          <p className="font-bold text-[#2F327D]">Quy định tiêu đề các cột trong file Excel:</p>
          <p className="text-slate-500">
            <code className="font-bold text-slate-700">firstName</code>,{' '}
            <code className="font-bold text-slate-700">lastName</code>,{' '}
            <code className="font-bold text-slate-700">email</code>,{' '}
            <code className="font-bold text-slate-700">phone</code>,{' '}
            <code className="font-bold text-slate-700">dob</code>,{' '}
            <code className="font-bold text-slate-700">gender</code>,{' '}
            <code className="font-bold text-slate-700">address</code>
          </p>
          <div className="text-slate-500 mt-1">
            <span className="font-semibold">Bắt buộc:</span>{' '}
            <span className="bg-rose-100 text-rose-700 px-1 rounded text-[9px] sm:text-[10px]">firstName</span>,{' '}
            <span className="bg-rose-100 text-rose-700 px-1 rounded text-[9px] sm:text-[10px]">lastName</span>,{' '}
            <span className="bg-rose-100 text-rose-700 px-1 rounded text-[9px] sm:text-[10px]">email</span>
          </div>
          <p className="text-slate-400 italic mt-1">
            * Username & password tự động tạo. Role mặc định STUDENT.
          </p>
        </div>
      </div>
    </div>
  );
}