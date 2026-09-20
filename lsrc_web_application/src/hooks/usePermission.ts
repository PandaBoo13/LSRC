import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function usePermission(permissionName: string): boolean {
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.permissions) {
      setHasPermission(user.permissions.includes(permissionName));
    }
  }, [user, permissionName]);

  return hasPermission;
}

export function usePermissions(permissionNames: string[]): boolean {
  const [hasAllPermissions, setHasAllPermissions] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.permissions) {
      setHasAllPermissions(
        permissionNames.every(p => user.permissions.includes(p))
      );
    }
  }, [user, permissionNames]);

  return hasAllPermissions;
}

export function useHasAnyPermission(permissionNames: string[]): boolean {
  const [hasAnyPermission, setHasAnyPermission] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.permissions) {
      setHasAnyPermission(
        permissionNames.some(p => user.permissions.includes(p))
      );
    }
  }, [user, permissionNames]);

  return hasAnyPermission;
}