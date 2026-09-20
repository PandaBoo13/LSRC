// utils/auth.ts
export const getAccessToken = (): string | null => {
  // Read from cookie, not localStorage
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserRole = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    return role.replace('ROLE_', '');
  } catch {
    return null;
  }
};