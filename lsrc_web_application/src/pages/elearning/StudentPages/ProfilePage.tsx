// src/pages/elearning/StudentPages/ProfilePage.tsx
import { useState, useEffect } from "react";
import { FaCamera, FaLock, FaSave, FaSpinner, FaTimes, FaBookOpen, FaClock } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { Toast, type ToastMessage } from "../../../components/elearning/ui/Toast";
import { inputClass, btnPrimaryClass } from "../../../components/elearning";
import { studentNav } from "../../../data/elearning";
import { getUserProfile, updateUserProfile, updateUserAvatar } from "../../../service/userService";
import { changePassword } from "../../../service/authService";
import { getEnrolledCourses } from "../../../service/orderService";
import { getMyProgress } from "../../../service/progress/progressService"; // ✅ Đổi courseProgressService → progressService
import { getAvatarUrl } from "../../../utils/imageHelper";
import type { UserInfo, UpdateProfileRequest } from "../../../types/rbac.types";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: "", lastName: "", phone: "", bio: "", dateOfBirth: "", gender: undefined, address: "",
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [data, enrollData, progressData] = await Promise.all([
        getUserProfile(),
        getEnrolledCourses().catch(() => []),
        getMyProgress().catch(() => []), // ✅ Đổi function
      ]);
      setProfile(data);
      setForm({
        firstName: data.firstName || "", lastName: data.lastName || "", phone: data.phone || "",
        bio: data.bio || "", dateOfBirth: data.dateOfBirth || "",
        gender: (data.gender as UpdateProfileRequest['gender']) || undefined, address: data.address || "",
      });
      setTotalCourses((enrollData as any[])?.length || 0);
      setTotalHours(Math.floor(((progressData as any[]) || []).reduce((s, p) => s + (p.totalTimeSpent || 0), 0) / 3600));
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Không thể tải thông tin", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleChange = (field: keyof UpdateProfileRequest, value: string) => 
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try { 
      setSaving(true); 
      const updated = await updateUserProfile(form);
      setProfile(updated); 
      showToast("Cập nhật thành công", "success"); 
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Cập nhật thất bại", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) return showToast("Vui lòng điền đầy đủ", "error");
    if (newPassword !== confirmPassword) return showToast("Mật khẩu mới không khớp", "error");
    if (newPassword.length < 8) return showToast("Mật khẩu ít nhất 8 ký tự", "error");
    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      showToast("Đổi mật khẩu thành công", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
      setShowPasswordModal(false);
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Đổi mật khẩu thất bại", "error"); 
    } finally { 
      setChangingPassword(false); 
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    try { 
      const updated = await updateUserAvatar(file);
      setProfile(updated); 
      showToast("Cập nhật avatar thành công", "success"); 
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Upload thất bại", "error"); 
    }
  };

  if (loading) return (
    <DashboardShell role="Student" title="Profile" subtitle="Đang tải..." navItems={studentNav}>
      <div className="flex justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Student" title="Profile" subtitle="Quản lý thông tin cá nhân" navItems={studentNav}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Panel className="text-center">
            <label className="relative mx-auto block h-28 w-28 cursor-pointer group">
              <img src={getAvatarUrl(profile?.avatarUrl)} alt="Avatar" className="h-28 w-28 rounded-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera size={20} />
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
            </label>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-[#49BBBD]/10 px-3 py-1 text-xs font-medium text-[#49BBBD]">{profile?.role}</span>
            <button onClick={() => setShowPasswordModal(true)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition">
              <FaLock size={11} />Đổi mật khẩu
            </button>
          </Panel>
          <div className="grid grid-cols-2 gap-3">
            <Panel className="text-center p-4">
              <FaBookOpen className="text-[#49BBBD] text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
              <p className="text-xs text-slate-500">Khóa học</p>
            </Panel>
            <Panel className="text-center p-4">
              <FaClock className="text-[#49BBBD] text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-900">{totalHours}h</p>
              <p className="text-xs text-slate-500">Giờ học</p>
            </Panel>
          </div>
        </div>
        <Panel>
          <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Field label="Họ" value={form.lastName} onChange={(v) => handleChange("lastName", v)} />
            <Field label="Tên" value={form.firstName} onChange={(v) => handleChange("firstName", v)} />
            <Field label="Email" value={profile?.email || ""} disabled />
            <Field label="Số điện thoại" value={form.phone} onChange={(v) => handleChange("phone", v)} />
            <Field label="Ngày sinh" type="date" value={form.dateOfBirth || ""} onChange={(v) => handleChange("dateOfBirth", v)} />
            <Field label="Giới tính" value={form.gender || ""} onChange={(v) => handleChange("gender", v)} placeholder="male/female/other" />
            <Field className="md:col-span-2" label="Địa chỉ" value={form.address} onChange={(v) => handleChange("address", v)} />
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">Bio</span>
              <textarea rows={3} value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} placeholder="Giới thiệu ngắn về bản thân" className={inputClass} />
            </label>
            <button type="submit" disabled={saving} className={`md:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3db0b2] transition ${saving ? "opacity-50" : ""}`}>
              {saving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </Panel>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPasswordModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <FaTimes size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h3>
            <form className="mt-5 grid gap-4" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
              <Field label="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={(v) => setPasswordForm(p => ({ ...p, currentPassword: v }))} />
              <Field label="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={(v) => setPasswordForm(p => ({ ...p, newPassword: v }))} />
              <Field label="Xác nhận mật khẩu mới" type="password" value={passwordForm.confirmPassword} onChange={(v) => setPasswordForm(p => ({ ...p, confirmPassword: v }))} />
              <button type="submit" disabled={changingPassword} className={`flex items-center justify-center gap-2 rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3db0b2] transition ${changingPassword ? "opacity-50" : ""}`}>
                {changingPassword ? <FaSpinner className="animate-spin" size={14} /> : <FaLock size={14} />}
                {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false, className = "" }: {
  label: string; value: string | undefined; onChange?: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">{label}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} className={`${inputClass} ${disabled ? "cursor-not-allowed bg-slate-50" : ""}`} />
    </label>
  );
}