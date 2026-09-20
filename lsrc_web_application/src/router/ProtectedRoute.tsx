// router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRole } from '../types/auth.types';

interface Props {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userRole = getUserRole(user); // Đã chuẩn hóa: TEACHER → INSTRUCTOR
    
    console.log('🔒 ProtectedRoute:', { 
      rawRole: user.role, 
      userRole, 
      allowedRoles,
      isAllowed: allowedRoles.includes(userRole)
    });
    
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;