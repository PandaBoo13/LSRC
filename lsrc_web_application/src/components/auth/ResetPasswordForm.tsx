import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// ✅ Sửa import
import { resetPassword } from '../../service/authService';

interface Props {
  email: string;
}

export default function ResetPasswordForm({ email }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, newPassword); // ✅ Đổi authService.resetPassword → resetPassword
      setSuccess('Đặt lại mật khẩu thành công!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        Đặt lại mật khẩu
      </h1>
      <p className="text-xs text-slate-500 mb-6 text-center">
        Nhập mật khẩu mới cho <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700">
            {success}
            <Link to="/login" className="block mt-2 font-semibold text-cyan-600 hover:text-cyan-700">
              Đi đến đăng nhập →
            </Link>
          </div>
        )}

        {!success && (
          <>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}