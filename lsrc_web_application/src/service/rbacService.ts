// src/service/rbacService.ts
import api from '../api/axiosConfig';
import type {
  RoleRequest,
  RoleResponse,
  PermissionRequest,
  PermissionResponse,
  AssignPermissionRequest,
  AssignRoleRequest,
  UserPermissionsResponse,
  RequestResponse,
  Role,
  Permission,
  Account
} from '../types/rbac.types';

// ==================== ROLES ====================

export const getAllRoles = () => {
  return api.get<RequestResponse>('/rbac/roles');
};

export const getRoleById = (id: number) => {
  return api.get<RequestResponse>(`/rbac/roles/${id}`);
};

export const createRole = (request: RoleRequest) => {
  return api.post<RequestResponse>('/rbac/roles', request);
};

export const updateRole = (id: number, request: RoleRequest) => {
  return api.put<RequestResponse>(`/rbac/roles/${id}`, request);
};

export const deleteRole = (id: number) => {
  return api.delete<RequestResponse>(`/rbac/roles/${id}`);
};

// ==================== PERMISSIONS ====================

export const getAllPermissions = () => {
  return api.get<RequestResponse>('/rbac/permissions');
};

export const getDefaultPermissions = () => {
  return api.get<RequestResponse>('/rbac/permissions/default');
};

export const getPermissionById = (id: number) => {
  return api.get<RequestResponse>(`/rbac/permissions/${id}`);
};

export const createPermission = (request: PermissionRequest) => {
  return api.post<RequestResponse>('/rbac/permissions', request);
};

export const updatePermission = (id: number, request: PermissionRequest) => {
  return api.put<RequestResponse>(`/rbac/permissions/${id}`, request);
};

export const deletePermission = (id: number) => {
  return api.delete<RequestResponse>(`/rbac/permissions/${id}`);
};

// ==================== ACCOUNT PERMISSIONS ====================

/**
 * Lấy tất cả quyền của account (bao gồm permission mặc định)
 */
export const getAccountPermissions = (accountId: number) => {
  return api.get<RequestResponse>(`/rbac/accounts/${accountId}/permissions`);
};

/**
 * Lấy quyền riêng của account (không bao gồm permission mặc định)
 */
export const getAccountCustomPermissions = (accountId: number) => {
  return api.get<RequestResponse>(`/rbac/accounts/${accountId}/permissions/custom`);
};

/**
 * Gán quyền cho account
 */
export const assignPermissionToAccount = (accountId: number, permissionId: number) => {
  return api.post<RequestResponse>(`/rbac/accounts/${accountId}/permissions`, { permissionId });
};

/**
 * Gán nhiều quyền cho account
 */
export const assignPermissionsToAccount = (accountId: number, permissionIds: number[]) => {
  return api.post<RequestResponse>(`/rbac/accounts/${accountId}/permissions/batch`, { permissionIds });
};

/**
 * Xóa quyền của account (hard delete)
 */
export const removePermissionFromAccount = (accountId: number, permissionId: number) => {
  return api.delete<RequestResponse>(`/rbac/accounts/${accountId}/permissions/${permissionId}`);
};

/**
 * Vô hiệu hóa quyền của account (tắt)
 */
export const deactivatePermission = (accountId: number, permissionId: number) => {
  return api.patch<RequestResponse>(`/rbac/accounts/${accountId}/permissions/${permissionId}/deactivate`);
};

/**
 * Kích hoạt quyền của account (bật)
 */
export const activatePermission = (accountId: number, permissionId: number) => {
  return api.patch<RequestResponse>(`/rbac/accounts/${accountId}/permissions/${permissionId}/activate`);
};

/**
 * Xóa tất cả quyền của account
 */
export const removeAllPermissions = (accountId: number) => {
  return api.delete<RequestResponse>(`/rbac/accounts/${accountId}/permissions`);
};

/**
 * Kiểm tra account có quyền không
 */
export const checkPermission = (accountId: number, permissionName: string) => {
  return api.get<RequestResponse>(
    `/rbac/accounts/${accountId}/permissions/check?permissionName=${permissionName}`
  );
};

/**
 * Kiểm tra account có quyền trên resource không
 */
export const checkPermissionOnResource = (accountId: number, resource: string, action: string) => {
  return api.get<RequestResponse>(
    `/rbac/accounts/${accountId}/permissions/check-resource?resource=${resource}&action=${action}`
  );
};

// ==================== ACCOUNT ROLES ====================

/**
 * Lấy role của account
 */
export const getUserRoles = (accountId: number) => {
  return api.get<RequestResponse>(`/rbac/accounts/${accountId}/roles`);
};

/**
 * Gán role cho account
 */
export const assignRoleToUser = (accountId: number, roleId: number) => {
  return api.put<RequestResponse>(`/rbac/accounts/${accountId}/role`, { roleId });
};

/**
 * Xóa role của account
 */
export const removeRoleFromUser = (accountId: number) => {
  return api.delete<RequestResponse>(`/rbac/accounts/${accountId}/role`);
};

/**
 * Lấy danh sách account theo role
 */
export const getUsersByRole = (roleId: number) => {
  return api.get<RequestResponse>(`/rbac/roles/${roleId}/accounts`);
};

// ==================== ACCOUNTS ====================

export const getAllAccounts = () => {
  return api.get<RequestResponse>('/rbac/accounts');
};

export const getTeachers = () => {
  return api.get<RequestResponse>('/rbac/accounts/teachers');
};

export const getAccountById = (accountId: number) => {
  return api.get<RequestResponse>(`/rbac/accounts/${accountId}`);
};

// Export types
export type {
  RoleRequest,
  RoleResponse,
  PermissionRequest,
  PermissionResponse,
  AssignPermissionRequest,
  AssignRoleRequest,
  UserPermissionsResponse,
  RequestResponse,
  Role,
  Permission,
  Account
};