import { useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <ResetPasswordForm email={email} />
    </div>
  );
}