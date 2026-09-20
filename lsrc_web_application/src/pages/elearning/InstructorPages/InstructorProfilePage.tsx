// src/pages/elearning/InstructorPages/InstructorProfilePage.tsx
import { useState, useEffect } from "react";
import { FaCamera, FaLock, FaSave, FaSpinner, FaTimes } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { Toast, type ToastMessage } from "../../../components/elearning/ui/Toast";
import { inputClass } from "../../../components/elearning";
import { instructorNav } from "../../../data/elearning";
// FIXED [CRITICAL]: dùng RichTextDisplay thay vì dangerouslySetInnerHTML.
import { RichTextDisplay } from "../../../components/ui/RichTextEditor/RichTextDisplay";
import { getUserProfile, updateUserProfile, updateUserAvatar } from "../../../service/userService";
import { getMyLecturerProfile } from "../../../service/lecturerService";
import { changePassword } from "../../../service/authService";
import { getAvatarUrl } from "../../../utils/imageHelper";
import type { UserInfo, UpdateProfileRequest } from "../../../types/rbac.types";
import type { LecturerProfileResponse } from "../../../types/lecturer.types";

export function InstructorProfilePage() {
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<LecturerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>('personal');

  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: "", lastName: "", phone: "", bio: "", dateOfBirth: "", gender: undefined, address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const showToast = (message: string, type: 'success' | 'error') =>
    setToast({ message, type });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const [userData, lecturerData] = await Promise.all([
        getUserProfile(),
        getMyLecturerProfile().catch(() => null),
      ]);
      setUserProfile(userData);
      setLecturerProfile(lecturerData);
      setForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        dateOfBirth: userData.dateOfBirth || "",
        gender: (userData.gender as UpdateProfileRequest['gender']) || undefined,
        address: userData.address || "",
      });
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Không thể tải thông tin", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateProfileRequest, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateUserProfile(form);
      setUserProfile(updated);
      showToast("Cập nhật thông tin cá nhân thành công", "success");
    } catch (err: any) {
      showToast(err?.message || "Cập nhật thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword)
      return showToast("Vui lòng điền đầy đủ thông tin", "error");
    if (newPassword !== confirmPassword)
      return showToast("Mật khẩu mới không khớp", "error");
    if (newPassword.length < 8)
      return showToast("Mật khẩu mới phải có ít nhất 8 ký tự", "error");

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
      setUserProfile(updated);
      showToast("Cập nhật avatar thành công", "success");
    } catch (err: any) {
      showToast(err?.message || "Upload avatar thất bại", "error");
    }
  };

  if (loading) {
    return (
      <DashboardShell
        role="Instructor"
        title="Profile"
        subtitle="Đang tải..."
        navItems={instructorNav}
      >
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Instructor"
      title="Hồ sơ giảng viên"
      subtitle="Quản lý thông tin cá nhân và chuyên môn"
      navItems={instructorNav}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* LEFT */}
        <div className="space-y-6">
          <Panel className="text-center">
            <label className="relative mx-auto block h-28 w-28 cursor-pointer group">
              <img
                src={getAvatarUrl(userProfile?.avatarUrl)}
                alt="Avatar"
                className="h-28 w-28 rounded-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera size={20} />
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {userProfile?.firstName} {userProfile?.lastName}
            </h2>
            <p className="text-sm text-slate-500">{userProfile?.email}</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                lecturerProfile?.isActive
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {lecturerProfile?.isActive ? '🟢 Đang hoạt động' : '🔴 Không hoạt động'}
            </span>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
            >
              <FaLock size={11} /> Đổi mật khẩu
            </button>
          </Panel>

          <Panel>
            <h3 className="text-sm font-bold text-slate-900">Chứng chỉ</h3>
            <p className="mt-2 text-3xl font-bold text-cyan-600">
              {lecturerProfile?.certificates?.length || 0}
            </p>
            <p className="text-xs text-slate-500">chứng chỉ đã đạt được</p>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'personal'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              👤 Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'professional'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              🎓 Chuyên môn
            </button>
          </div>

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <Panel>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <Field label="Họ" value={form.lastName} onChange={(v) => handleChange("lastName", v)} placeholder="Họ" />
                <Field label="Tên" value={form.firstName} onChange={(v) => handleChange("firstName", v)} placeholder="Tên" />
                <Field label="Email" value={userProfile?.email || ""} disabled />
                <Field label="Số điện thoại" value={form.phone} onChange={(v) => handleChange("phone", v)} placeholder="Số điện thoại" />
                <Field label="Ngày sinh" type="date" value={form.dateOfBirth || ""} onChange={(v) => handleChange("dateOfBirth", v)} />
                <Field label="Giới tính" value={form.gender || ""} onChange={(v) => handleChange("gender", v)} placeholder="male/female/other" />
                <Field className="md:col-span-2" label="Địa chỉ" value={form.address} onChange={(v) => handleChange("address", v)} placeholder="Địa chỉ" />
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">Bio</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Giới thiệu ngắn về bản thân"
                    className={inputClass}
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className={`md:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </Panel>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <Panel>
                <h2 className="text-lg font-bold text-slate-900">Chuyên môn</h2>
                <p className="mt-1 text-xs text-slate-400">Thông tin do Admin quản lý</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Info
                    label="Chuyên ngành"
                    value={lecturerProfile?.specialties
                      ? JSON.parse(lecturerProfile.specialties).join(', ')
                      : null}
                  />
                  <Info
                    label="Kinh nghiệm"
                    value={lecturerProfile?.experienceYears
                      ? `${lecturerProfile.experienceYears} năm`
                      : 'Chưa có'}
                  />
                  <Info label="Website" value={lecturerProfile?.website} />
                  <Info label="LinkedIn" value={lecturerProfile?.linkedin} />
                </div>
              </Panel>

              <Panel>
                <h2 className="text-lg font-bold text-slate-900">Mô tả chuyên môn</h2>
                {lecturerProfile?.expertise ? (
                  // FIXED [CRITICAL]: dùng RichTextDisplay thay vì dangerouslySetInnerHTML.
                  <RichTextDisplay
                    content={lecturerProfile.expertise}
                    prose={false}
                    className="mt-2 text-sm text-slate-600 prose prose-slate max-w-none"
                  />
                ) : (
                  <p className="mt-2 text-sm text-slate-400">Chưa có mô tả</p>
                )}
              </Panel>

              <Panel>
                <h2 className="text-lg font-bold text-slate-900">Học vấn</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {lecturerProfile?.education || 'Chưa cập nhật'}
                </p>
              </Panel>

              <Panel>
                <h2 className="text-lg font-bold text-slate-900">
                  Chứng chỉ ({lecturerProfile?.certificates?.length || 0})
                </h2>
                {lecturerProfile?.certificates && lecturerProfile.certificates.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {lecturerProfile.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{cert.name}</p>
                          <p className="text-xs text-slate-500">{cert.issuingOrganization}</p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {cert.issueDate
                            ? new Date(cert.issueDate).toLocaleDateString('vi-VN')
                            : ''}
                          {cert.expiryDate
                            ? ` - ${new Date(cert.expiryDate).toLocaleDateString('vi-VN')}`
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">Chưa có chứng chỉ nào</p>
                )}
              </Panel>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập mật khẩu hiện tại và mật khẩu mới.
            </p>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleChangePassword();
              }}
            >
              <Field
                label="Mật khẩu hiện tại"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <Field
                label="Mật khẩu mới"
                type="password"
                value={passwordForm.newPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
                placeholder="Ít nhất 8 ký tự"
              />
              <Field
                label="Xác nhận mật khẩu mới"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="submit"
                disabled={changingPassword}
                className={`flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition ${
                  changingPassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {changingPassword ? (
                  <FaSpinner className="animate-spin" size={14} />
                ) : (
                  <FaLock size={14} />
                )}
                {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  className = "",
}: {
  label: string;
  value: string | undefined;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClass} ${disabled ? "cursor-not-allowed bg-slate-50" : ""}`}
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}