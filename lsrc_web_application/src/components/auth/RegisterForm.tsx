import { useState } from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaUser,
  FaLock,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(username, password, email);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
   } catch (err: any) {
  const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
  setError(msg);
}finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-xs text-green-600">
          {success}
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <FaEnvelope
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-xs
            text-slate-400
          "
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            pl-9
            pr-4
            text-sm
            outline-none
            transition-all
            duration-200
            focus:border-cyan-500
            focus:bg-white
            focus:ring-4
            focus:ring-cyan-100
          "
        />
      </div>

      {/* Username */}
      <div className="relative">
        <FaUser
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-xs
            text-slate-400
          "
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            pl-9
            pr-4
            text-sm
            outline-none
            transition-all
            duration-200
            focus:border-cyan-500
            focus:bg-white
            focus:ring-4
            focus:ring-cyan-100
          "
        />
      </div>

      {/* Password */}
      <div className="relative">
        <FaLock
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-xs
            text-slate-400
          "
        />

        <input
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            pl-9
            pr-10
            text-sm
            outline-none
            transition-all
            duration-200
            focus:border-cyan-500
            focus:bg-white
            focus:ring-4
            focus:ring-cyan-100
          "
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
            transition
            hover:text-slate-600
          "
        >
          {showPassword ? (
            <FaEyeSlash size={14} />
          ) : (
            <FaEye size={14} />
          )}
        </button>
      </div>

      {/* Register */}
      <button
        type="submit"
        disabled={loading}
        className="
          h-10
          w-full
          rounded-lg
          bg-gradient-to-r
          from-cyan-500
          to-teal-500
          text-sm
          font-semibold
          text-white
          shadow-lg
          shadow-cyan-200/40
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-xl
          active:translate-y-0
          disabled:opacity-50
        "
      >
        {loading ? 'Creating...' : 'Create Account'}
      </button>

      {/* Login */}
      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="
            font-semibold
            text-cyan-600
            transition
            hover:text-cyan-700
          "
        >
          Login
        </Link>
      </p>
    </form>
  );
}
