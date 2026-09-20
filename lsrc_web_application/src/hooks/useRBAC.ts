// src/hooks/useRBAC.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacService } from '../service/rbacService';
import { message } from 'antd';

export const useRBAC = () => {
  const queryClient = useQueryClient();

  // ==================== ROLES ====================
  const useRoles = () => {
    return useQuery({
      queryKey: ['roles'],
      queryFn: async () => {
        const response = await rbacService.getAllRoles();
        return response.data.data;
      },
    });
  };

  const useCreateRole = () => {
    return useMutation({
      mutationFn: rbacService.createRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        message.success('Role created successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to create role');
      },
    });
  };

  const useUpdateRole = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) =>
        rbacService.updateRole(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        message.success('Role updated successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to update role');
      },
    });
  };

  const useDeleteRole = () => {
    return useMutation({
      mutationFn: rbacService.deleteRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        message.success('Role deleted successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to delete role');
      },
    });
  };

  // ==================== PERMISSIONS ====================
  const usePermissions = () => {
    return useQuery({
      queryKey: ['permissions'],
      queryFn: async () => {
        const response = await rbacService.getAllPermissions();
        return response.data.data;
      },
    });
  };

  const useDefaultPermissions = () => {
    return useQuery({
      queryKey: ['defaultPermissions'],
      queryFn: async () => {
        const response = await rbacService.getDefaultPermissions();
        return response.data.data;
      },
    });
  };

  const useCreatePermission = () => {
    return useMutation({
      mutationFn: rbacService.createPermission,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        queryClient.invalidateQueries({ queryKey: ['defaultPermissions'] });
        message.success('Permission created successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to create permission');
      },
    });
  };

  const useUpdatePermission = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) =>
        rbacService.updatePermission(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        queryClient.invalidateQueries({ queryKey: ['defaultPermissions'] });
        message.success('Permission updated successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to update permission');
      },
    });
  };

  const useDeletePermission = () => {
    return useMutation({
      mutationFn: rbacService.deletePermission,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        queryClient.invalidateQueries({ queryKey: ['defaultPermissions'] });
        message.success('Permission deleted successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to delete permission');
      },
    });
  };

  // ==================== ACCOUNT PERMISSIONS ====================
  const useAccountPermissions = (accountId: number) => {
    return useQuery({
      queryKey: ['accountPermissions', accountId],
      queryFn: async () => {
        const response = await rbacService.getAccountPermissions(accountId);
        return response.data.data;
      },
      enabled: !!accountId,
    });
  };

  const useAssignPermission = () => {
    return useMutation({
      mutationFn: ({ accountId, permissionId }: { accountId: number; permissionId: number }) =>
        rbacService.assignPermissionToAccount(accountId, permissionId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['accountPermissions', variables.accountId] });
        queryClient.invalidateQueries({ queryKey: ['accountCustomPermissions', variables.accountId] });
        message.success('Permission assigned successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to assign permission');
      },
    });
  };

  const useDeactivatePermission = () => {
    return useMutation({
      mutationFn: ({ accountId, permissionId }: { accountId: number; permissionId: number }) =>
        rbacService.deactivatePermission(accountId, permissionId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['accountPermissions', variables.accountId] });
        queryClient.invalidateQueries({ queryKey: ['accountCustomPermissions', variables.accountId] });
        message.success('Permission deactivated successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to deactivate permission');
      },
    });
  };

  const useActivatePermission = () => {
    return useMutation({
      mutationFn: ({ accountId, permissionId }: { accountId: number; permissionId: number }) =>
        rbacService.activatePermission(accountId, permissionId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['accountPermissions', variables.accountId] });
        queryClient.invalidateQueries({ queryKey: ['accountCustomPermissions', variables.accountId] });
        message.success('Permission activated successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to activate permission');
      },
    });
  };

  // ==================== ACCOUNT ROLES ====================
  const useAccountRoles = (accountId: number) => {
    return useQuery({
      queryKey: ['accountRoles', accountId],
      queryFn: async () => {
        const response = await rbacService.getUserRoles(accountId);
        return response.data.data;
      },
      enabled: !!accountId,
    });
  };

  const useAssignRole = () => {
    return useMutation({
      mutationFn: ({ accountId, roleId }: { accountId: number; roleId: number }) =>
        rbacService.assignRoleToUser(accountId, roleId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['accountRoles', variables.accountId] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        message.success('Role assigned successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to assign role');
      },
    });
  };

  const useRemoveRole = () => {
    return useMutation({
      mutationFn: rbacService.removeRoleFromUser,
      onSuccess: (_, accountId) => {
        queryClient.invalidateQueries({ queryKey: ['accountRoles', accountId] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        message.success('Role removed successfully');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to remove role');
      },
    });
  };

  // ==================== ACCOUNTS ====================
  const useAccounts = () => {
    return useQuery({
      queryKey: ['accounts'],
      queryFn: async () => {
        const response = await rbacService.getAllAccounts();
        return response.data.data;
      },
    });
  };

  return {
    // Roles
    useRoles,
    useCreateRole,
    useUpdateRole,
    useDeleteRole,
    // Permissions
    usePermissions,
    useDefaultPermissions,
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
    // Account Permissions
    useAccountPermissions,
    useAssignPermission,
    useDeactivatePermission,
    useActivatePermission,
    // Account Roles
    useAccountRoles,
    useAssignRole,
    useRemoveRole,
    // Accounts
    useAccounts,
  };
};