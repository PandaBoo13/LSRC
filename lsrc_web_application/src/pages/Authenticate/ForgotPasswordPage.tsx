import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { authService } from '../../service/authService';

interface Props {
  onOtpSent: (email: string) => void;
}

export default function ForgotPasswordForm({ onOtpSent }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await authService.forgotPassword(email);

      setMessage('OTP đã được gửi đến email của bạn.');
      
      // Gọi callback để chuyển sang bước OTP
      onOtpSent(email);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Có lỗi xảy ra, vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        Quên mật khẩu
      </h1>
      <p className="text-xs text-slate-500 mb-6 text-center">
        Nhập email để nhận mã OTP
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Nhớ mật khẩu rồi?{' '}
          <Link
            to="/login"
            className="font-semibold text-cyan-600 transition hover:text-cyan-700"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}