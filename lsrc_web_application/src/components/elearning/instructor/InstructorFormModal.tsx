// src/components/elearning/instructor/InstructorFormModal.tsx
import { useState } from "react";
import { 
  FaTimes, 
  FaSave, 
  FaSpinner, 
  FaPlus, 
  FaTrash, 
  FaUserGraduate, 
  FaBriefcase, 
  FaGlobe, 
  FaLinkedin, 
  FaGraduationCap,
  FaExclamationCircle
} from "react-icons/fa";
import { RichTextEditor } from "../../ui/RichTextEditor";
// ✅ Sửa import
import { createLecturerProfile, updateLecturerProfile } from "../../../service/lecturerService";
import type { LecturerProfileResponse, LecturerProfileRequest } from "../../../types/lecturer.types";

type Props = {
  profile: LecturerProfileResponse;
  onClose: () => void;
  onSuccess: () => void;
};

export function InstructorFormModal({ profile, onClose, onSuccess }: Props) {
  const initialSpecialties = (() => {
    if (!profile.specialties) return [""];
    if (Array.isArray(profile.specialties)) return profile.specialties;
    try {
      const parsed = JSON.parse(profile.specialties);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [""];
    } catch {
      return [""];
    }
  })();

  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties);
  const [form, setForm] = useState<LecturerProfileRequest>({
    expertise: profile.expertise || "",
    experienceYears: profile.experienceYears || 0,
    education: profile.education || "",
    website: profile.website || "",
    linkedin: profile.linkedin || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const validSpecialties = specialties.map(s => s.trim()).filter(Boolean);
    if (validSpecialties.length === 0) { 
      setError("Vui lòng nhập ít nhất 1 chuyên ngành giảng dạy."); 
      return; 
    }

    try {
      setError("");
      setSaving(true);
      const data: LecturerProfileRequest = { 
        ...form, 
        specialties: JSON.stringify(validSpecialties) 
      };

      if (profile.id) {
        // ✅ Đổi lecturerService.update → updateLecturerProfile
        await updateLecturerProfile(profile.id, data);
      } else {
        // ✅ Đổi lecturerService.create → createLecturerProfile (không cần userId)
        await createLecturerProfile(data);
      }

      onSuccess(); 
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lưu hồ sơ thất bại. Vui lòng thử lại.");
    } finally { 
      setSaving(false); 
    }
  };

  const addSpecialty = () => setSpecialties([...specialties, ""]);
  
  const removeSpecialty = (index: number) => { 
    if (specialties.length > 1) {
      setSpecialties(specialties.filter((_, i) => i !== index)); 
    } else {
      setSpecialties([""]);
    }
  };

  const updateSpecialty = (index: number, value: string) => {
    const updated = [...specialties];
    updated[index] = value;
    setSpecialties(updated);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-cyan-50/80 via-white to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 ring-1 ring-cyan-500/20">
                <FaUserGraduate size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {profile.id ? "Cập nhật hồ sơ giảng viên" : "Tạo hồ sơ giảng viên"}
                </h2>
                <p className="text-xs font-semibold text-cyan-600">
                  {profile.firstName} {profile.lastName} {profile.email ? `• ${profile.email}` : ''}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium rounded-2xl">
              <FaExclamationCircle className="flex-shrink-0" size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Chuyên ngành */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FaBriefcase className="text-cyan-600" size={13} />
                Chuyên ngành giảng dạy
              </label>
              <button 
                type="button"
                onClick={addSpecialty}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-700 bg-cyan-100/70 hover:bg-cyan-500 hover:text-white rounded-xl transition-all shadow-2xs"
              >
                <FaPlus size={10} /> Thêm chuyên ngành
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {specialties.map((spec, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-1.5 pl-3 rounded-xl border border-slate-200/80 shadow-2xs focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                  <input
                    type="text"
                    value={spec}
                    onChange={e => updateSpecialty(i, e.target.value)}
                    placeholder="VD: Lập trình ReactJS..."
                    className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                  />
                  <button 
                    type="button"
                    onClick={() => removeSpecialty(i)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                    title="Xóa chuyên ngành"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mô tả chuyên môn */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <FaGraduationCap className="text-cyan-600" size={14} />
              Mô tả chuyên môn & Kinh nghiệm
            </label>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
              <RichTextEditor
                value={form.expertise || ""}
                onChange={(v) => setForm(p => ({...p, expertise: v}))}
                placeholder="Mô tả chi tiết về kinh nghiệm giảng dạy..."
                height={160}
              />
            </div>
          </div>

          {/* Grid: Kinh nghiệm + Học vấn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FaBriefcase className="text-cyan-600" size={13} />
                Số năm kinh nghiệm
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                <input 
                  type="number" 
                  min={0}
                  max={50}
                  value={String(form.experienceYears)}
                  onChange={e => setForm(p => ({...p, experienceYears: Math.max(0, Number(e.target.value))}))}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent outline-none" 
                />
                <span className="text-xs font-semibold text-slate-400">Năm</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FaGraduationCap className="text-cyan-600" size={13} />
                Học vấn / Trình độ
              </label>
              <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                <input 
                  type="text"
                  value={form.education}
                  onChange={e => setForm(p => ({...p, education: e.target.value}))}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                  placeholder="VD: Thạc sĩ Khoa học Máy tính - ĐH Bách Khoa" 
                />
              </div>
            </div>
          </div>

          {/* Grid: Website + LinkedIn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FaGlobe className="text-cyan-600" size={13} />
                Website cá nhân
              </label>
              <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                <input 
                  type="url"
                  value={form.website}
                  onChange={e => setForm(p => ({...p, website: e.target.value}))}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                  placeholder="https://yourwebsite.com" 
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FaLinkedin className="text-cyan-600" size={13} />
                Trang LinkedIn
              </label>
              <div className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                <input 
                  type="url"
                  value={form.linkedin}
                  onChange={e => setForm(p => ({...p, linkedin: e.target.value}))}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                  placeholder="https://linkedin.com/in/username" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Hủy
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all"
          >
            {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
            <span>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}