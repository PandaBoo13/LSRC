import { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ToastMessage } from '../../components/elearning/ui/Toast';
import { getErrorMessage } from '../../utils/errorUtils';

interface LoginFormProps {
  showToast: (toast: ToastMessage) => void;
}

export default function LoginForm({ showToast }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(username, password);
      console.log('🔍 Login result:', result);

      if (result && result.success === false) {
        showToast({ 
          message: result.message || 'Đăng nhập thất bại', 
          type: 'error' 
        });
      } else if (result && result.success === true) {
        showToast({ 
          message: 'Đăng nhập thành công!', 
          type: 'success' 
        });
      }
    } catch (err: any) {
      console.error('🔴 Login error:', err);
      showToast({ 
        message: getErrorMessage(err, 'Đăng nhập thất bại'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="relative">
        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100" 
        />
      </div>
      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100" 
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
        >
          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-slate-500">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-200" /> Remember me
        </label>
        <Link to="/forgot-password" className="font-medium text-cyan-600 transition hover:text-cyan-700">Forgot?</Link>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-center text-xs text-slate-500">Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-cyan-600 transition hover:text-cyan-700">Register</Link>
      </p>
    </form>
  );
}