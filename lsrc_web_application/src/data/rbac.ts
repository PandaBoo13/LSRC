// src/data/rbac.ts
import type { NavItem } from './elearning';  // Hoặc import từ đúng file

export const rbacNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: 'grid' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Instructors', to: '/admin/instructors', icon: 'user' },
  { label: 'Courses', to: '/admin/courses', icon: 'book' },
  { label: 'Categories', to: '/admin/categories', icon: 'layers' },
  { label: 'Orders', to: '/admin/orders', icon: 'card' },
  { label: 'Roles', to: '/admin/roles', icon: 'shield' },
  { label: 'Permissions', to: '/admin/permissions', icon: 'key' },
  { label: 'User Roles', to: '/admin/user-roles', icon: 'user-check' },
  { label: 'Reports', to: '/admin/reports', icon: 'chart' },
  { label: 'Audit Log', to: '/admin/audit-log', icon: 'clock' },
  { label: 'Settings', to: '/admin/settings', icon: 'settings' },
];

export const resourceColors: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-700',
  ROLE: 'bg-purple-100 text-purple-700',
  PERMISSION: 'bg-indigo-100 text-indigo-700',
  COURSE: 'bg-green-100 text-green-700',
  STUDENT: 'bg-orange-100 text-orange-700',
  PROFILE: 'bg-pink-100 text-pink-700',
  REVENUE: 'bg-teal-100 text-teal-700',
  REPORT: 'bg-red-100 text-red-700',
};

export const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  INSTRUCTOR: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-green-100 text-green-700',
};