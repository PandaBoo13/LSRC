import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toast } from '../../components/elearning/ui/Toast';
import type { ToastMessage } from '../../components/elearning/ui/Toast';

interface Props {
  loginForm: React.ReactNode | ((showToast: (toast: ToastMessage) => void) => React.ReactNode);
  registerForm: React.ReactNode;
  forgotPasswordForm: React.ReactNode;
}

export default function AuthLayout({ loginForm, registerForm, forgotPasswordForm }: Props) {
  const location = useLocation();
  const path = location.pathname;
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const getTabIndex = () => {
    if (path === '/register') return 1;
    if (path === '/forgot-password') return 2;
    return 0;
  };

  const tabIndex = getTabIndex();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-12">
      
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mx-auto flex min-h-[calc(100vh-96px)] items-center justify-center">
        <div className="flex w-full max-w-[920px] overflow-hidden rounded-[28px] bg-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]">
          
          {/* LEFT */}
          <div className="relative hidden w-[45%] lg:block">
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop" alt="Learning" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl font-bold leading-tight">Learn Anytime, <br /> Anywhere</h2>
              <p className="mt-2 text-sm text-white/90">Modern education platform for students and teachers.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex w-full items-center justify-center p-8 lg:w-[55%]">
            <div className="w-full max-w-[340px]">
              {/* LOGO */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-xl font-bold text-white shadow-lg">T</div>
              </div>

              <h2 className="text-center text-2xl font-bold text-slate-800">Welcome to TOTC 👋</h2>
              <p className="mt-1 text-center text-sm text-slate-500">Continue your learning journey</p>

              {/* TAB */}
              <div className="my-6 flex justify-center">
                <div className="relative flex rounded-full bg-cyan-100 p-1">
                  <div className="absolute top-1 h-10 w-[100px] rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 ease-in-out" style={{ left: `${tabIndex * 100 + 4}px` }} />
                  <Link to="/login" className="relative z-10 flex h-10 w-[100px] items-center justify-center text-xs font-semibold text-white">Login</Link>
                  <Link to="/register" className="relative z-10 flex h-10 w-[100px] items-center justify-center text-xs font-semibold text-white">Register</Link>
                  <Link to="/forgot-password" className="relative z-10 flex h-10 w-[100px] items-center justify-center text-xs font-semibold text-white">Forgot</Link>
                </div>
              </div>

              {/* FORM SLIDER */}
              <div className="overflow-x-hidden">
                <div className="flex w-[300%] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${tabIndex * 33.333}%)` }}>
                  <div className="w-1/3 shrink-0 px-3">
                    {/* ✅ SỬA: Gọi loginForm như một function và truyền setToast */}
                    {typeof loginForm === 'function' ? loginForm(setToast) : null}
                  </div>
                  <div className="w-1/3 shrink-0 px-3">{registerForm}</div>
                  <div className="w-1/3 shrink-0 px-3">{forgotPasswordForm}</div>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-slate-400">© 2026 TOTC Learning Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}