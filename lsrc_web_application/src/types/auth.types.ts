// src/types/auth.types.ts

// ==================== Request Types ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ==================== Response Types ====================

export interface UserInfoResponse {

  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  provider: string;
  avatarUrl?: string;
}

export interface RequestResponse {
  status: string;
  timestamp: string;
  message: string | null;
  data: any | null;
}

export interface AuthResponse extends RequestResponse {
  data: {
    accessToken?: string;
    user?: UserInfoResponse;
  };
}

// ==================== User Type ====================

export interface User {
  idAccount: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  provider: string;
}

// ==================== Auth Context Type ====================

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, email: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  checkAuth: () => Promise<boolean>;
  getRedirectPath?: (userData: User) => string;
}

// ==================== Role Constants ====================

export const ROLE_REDIRECTS: Record<string, string> = {
  ROLE_ADMIN: '/admin',
  ROLE_ADMIN2: '/admin',
  ROLE_INSTRUCTOR: '/instructor',
  ROLE_TEACHER: '/instructor',       // ✅ Thêm TEACHER → /instructor
  ROLE_STUDENT: '/dashboard',
  ADMIN: '/admin',
  ADMIN2: '/admin',
  INSTRUCTOR: '/instructor',
  TEACHER: '/instructor',             // ✅ Thêm TEACHER → /instructor
  STUDENT: '/dashboard',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  ADMIN2: 'ADMIN2',
  INSTRUCTOR: 'INSTRUCTOR',
  TEACHER: 'TEACHER',                // ✅ Thêm TEACHER
  STUDENT: 'STUDENT',
} as const;

// ==================== Helper Functions ====================

/**
 * Lấy role name từ user object (đã bỏ prefix ROLE_ và chuẩn hóa)
 * "ROLE_ADMIN" → "ADMIN"
 * "ROLE_TEACHER" → "INSTRUCTOR" (chuẩn hóa)
 */
export const getUserRole = (user: User | null): string => {
  if (!user || !user.role) return '';
  
  const role = user.role.replace('ROLE_', '');
  
  // ✅ Chuẩn hóa: TEACHER → INSTRUCTOR
  if (role === 'TEACHER') return 'INSTRUCTOR';
  if (role === 'ADMIN2') return 'ADMIN';
  
  return role;
};

/**
 * Lấy redirect path dựa vào role
 */
export const getRedirectPath = (userData: User): string => {
  // Thử với role đầy đủ (có ROLE_)
  if (ROLE_REDIRECTS[userData.role]) {
    return ROLE_REDIRECTS[userData.role];
  }
  
  // Thử với role đã bỏ ROLE_
  const cleanRole = userData.role.replace('ROLE_', '');
  if (ROLE_REDIRECTS[cleanRole]) {
    return ROLE_REDIRECTS[cleanRole];
  }
  
  // Chuẩn hóa
  if (cleanRole === 'TEACHER') return '/instructor';
  if (cleanRole === 'ADMIN2') return '/admin';
  
  // Mặc định
  console.log('⚠️ Unknown role, redirecting to /');
  return '/';
};

/**
 * Kiểm tra user có role được phép không
 */
export const hasRole = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false;
  
  const userRole = getUserRole(user);     // "ADMIN", "INSTRUCTOR", "STUDENT"
  const rawRole = user.role.replace('ROLE_', ''); // Role gốc
  
  return allowedRoles.some(role => 
    role === userRole || role === rawRole || role === user.role
  );
};