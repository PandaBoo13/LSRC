// src/types/rbac.types.ts

// ==================== Request Types ====================
export interface RoleRequest {
  roleName: string;
}

export interface PermissionRequest {
  permissionName: string;
  resource: string;
  action: string;
  description?: string;
  isDefault?: boolean;
}

export interface AssignPermissionRequest {
  permissionId?: number;
  permissionIds?: number[];
}

export interface AssignRoleRequest {
  roleId: number;
}

export interface AssignRoleToUserRequest {
  accountId: number;
  roleId: number;
}

// ==================== USER PROFILE ====================
export interface UserInfo {
  idAccount: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  provider?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  updatedAt?: string | null;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

// ==================== Response Types ====================
export interface PermissionResponse {
  idPermission: number;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
  isDefault?: boolean;
}

export interface RoleResponse {
  idRole: number;
  roleName: string;
  accountCount: number;
}

export interface UserPermissionsResponse {
  accountId: number;
  username: string;
  roles: string[];
  permissions: string[];
  permissionsByResource?: Record<string, string[]>;
}

// ==================== Entity Types ====================
export interface Role {
  idRole: number;
  roleName: string;
  accountCount?: number;
  accounts?: Account[];
  createdAt?: string;
}

export interface Permission {
  idPermission: number;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountPermission {
  idAccountPermission: number;
  accountId: number;
  permissionId: number;
  isActive: boolean;
  createdAt: string;
  permission?: Permission;
  account?: Account;
}

export interface Account {
  idAccount: number;
  username: string;
  password?: string;
  email: string;
  provider?: string;
  role?: string; // ✅ SỬA: Chỉ là string, không phải string | Role
  roleId?: number;
  createdAt?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  user?: User;
  accountPermissions?: AccountPermission[];
}

export interface User {
  idUser: number;
  firstName: string;
  lastName: string;
  accountId: number;
  account?: Account;
}

// ==================== Common Types ====================
export interface RequestResponse {
  success?: boolean;
  status?: string;
  message?: string;
  data: any;
  timestamp?: string;
}

// ==================== Component Props Types ====================
export interface PermissionCardProps {
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

export interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAssignUser?: (role: Role) => void;
}

export interface UserListTableProps {
  accounts: Account[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectAccount: (account: Account) => void;
  onManagePermissions: (account: Account) => void;
}

export interface AssignPermissionModalProps {
  accountId: number;
  accountName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AssignRoleModalProps {
  account: Account;
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}

export interface CreatePermissionPanelProps {
  onClose: () => void;
  onCreate: (data: {
    permissionName: string;
    resource: string;
    action: string;
    description: string;
    isDefault?: boolean;
  }) => void;
}

export interface CreateRolePanelProps {
  onCreate: (roleName: string) => void;
  onCancel: () => void;
}

export interface EditPermissionModalProps {
  permission: Permission | null;
  onClose: () => void;
  onSuccess: () => void;
}