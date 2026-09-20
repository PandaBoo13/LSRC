import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
// ✅ Sửa import
import { changePassword } from '../../service/authService';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordForm() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword); // ✅ Đổi authService.changePassword → changePassword
      setSuccess('Đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="text-center py-4 text-sm text-slate-500">
        Đang kiểm tra...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700 text-center">
        ⚠️ Bạn cần đăng nhập để đổi mật khẩu.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-cyan-50 p-2 text-xs text-cyan-700 text-center">
        👤 <strong>{user.username || user.email}</strong>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700">{success}</div>
      )}

      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type={showCurrent ? 'text' : 'password'}
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {showCurrent ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>

      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type={showNew ? 'text' : 'password'}
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>

      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition-all hover:-translate-y-0.5 disabled:opacity-50"
      >
        {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}