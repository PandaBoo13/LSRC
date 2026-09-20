import { useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
// ✅ Sửa import
import { verifyOtp } from '../../service/authService';

interface Props {
  email: string;
  onVerified: () => void;
}

export default function VerifyOtpForm({ email, onVerified }: Props) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email, otp); // ✅ Đổi authService.verifyOtp → verifyOtp
      onVerified();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-xs text-slate-500 text-center">
        Mã OTP đã được gửi đến <strong>{email}</strong>
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="relative">
        <FaShieldAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type="text"
          placeholder="Nhập mã OTP 6 số"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-center text-lg tracking-widest outline-none transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
      >
        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
      </button>
    </form>
  );
}