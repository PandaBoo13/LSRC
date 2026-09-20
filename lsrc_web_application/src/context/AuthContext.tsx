import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi, logout as logoutApi, checkAuth as checkAuthApi } from '../service/authService';
import { getUserProfile } from '../service/userService';
import type { User, AuthContextType } from '../types/auth.types';
import { getRedirectPath } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      // Gọi trực tiếp API /users/profile để lấy thông tin chi tiết (bao gồm avatarUrl)
      const profileData = await getUserProfile();
      console.log('👤 User profile loaded:', profileData);

      if (profileData) {
        const userData = profileData as unknown as User;
        setUser(userData);
        return userData;
      }
      setUser(null);
      return null;
    } catch (error: any) {
      console.error('🔴 refreshUser failed:', error?.message);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const publicPaths = ['/login', '/register', '/forgot-password'];
        if (!publicPaths.some(path => window.location.pathname.includes(path))) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Init auth failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    try {
      const res = await loginApi({ username, password });
      console.log('🟢 login - response:', res.data);
      if (res.data.status === 'success') {
        const userData = await refreshUser();
        if (userData) {
          navigate(getRedirectPath(userData), { replace: true });
          return { success: true, message: 'Login successful' };
        }
        return { success: false, message: 'Không thể lấy thông tin người dùng' };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error: any) {
      console.log('🔴 Error response:', error?.response?.data);
      const message = error?.response?.data?.message || error?.message || 'Login failed';
      console.log('🔴 Error message:', message);
      return { success: false, message };
    }
  };

  const register = async (username: string, password: string, email: string, firstName?: string, lastName?: string) => {
    try {
      const res = await registerApi({ username, password, email, firstName: firstName || '', lastName: lastName || '' });
      if (res.data.status === 'success') {
        navigate('/login', { replace: true });
        return { success: true, message: 'Registration successful' };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (error: any) {
      console.error('🔴 Register error:', error?.message);
      return { success: false, message: error?.response?.data?.message || error?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try { 
      await logoutApi(); 
    } catch (error) { 
      console.error('🔴 Logout error:', error); 
    } finally { 
      setUser(null); 
      navigate('/login', { replace: true }); 
    }
  };

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await checkAuthApi();
      if (res.data.status === 'success') { 
        await refreshUser(); 
        return true; 
      }
      return false;
    } catch (error) { 
      console.error('🔴 Check auth failed:', error); 
      return false; 
    }
  }, [refreshUser]);

  const contextValue: AuthContextType = {
    user, loading, isAuthenticated: !!user, login, register, logout, refreshUser, checkAuth,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthProvider;