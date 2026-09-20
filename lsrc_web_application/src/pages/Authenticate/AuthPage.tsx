import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import type { ToastMessage } from '../../components/elearning/ui/Toast';

export default function AuthPage() {
  return (
    <AuthLayout
      // ✅ Truyền LoginForm như function để nhận showToast
      loginForm={(showToast: (toast: ToastMessage) => void) => (
        <LoginForm showToast={showToast} />
      )}
      registerForm={<RegisterForm />}
      forgotPasswordForm={<ForgotPasswordForm />}
    />
  );
}