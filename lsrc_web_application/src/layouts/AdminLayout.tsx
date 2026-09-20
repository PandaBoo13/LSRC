// src/components/elearning/layout/AdminLayout.tsx
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom'; // ✅ Thêm Outlet
import { 
  FaHome, 
  FaUserShield, 
  FaLock, 
  FaUsers, 
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaBook,
  FaShoppingCart,
  FaTag,
  FaStar,
  FaChartBar,
  FaClock,
  FaCog
} from 'react-icons/fa';

// ❌ Không cần children nữa
export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FaHome },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/instructors', label: 'Instructors', icon: FaUsers },
    { path: '/admin/courses', label: 'Courses', icon: FaBook },
    { path: '/admin/categories', label: 'Categories', icon: FaBook },
    { path: '/admin/reviews', label: 'Reviews', icon: FaStar },
    { path: '/admin/orders', label: 'Orders', icon: FaShoppingCart },
    { path: '/admin/coupons', label: 'Coupons', icon: FaTag },
    { path: '/admin/reports', label: 'Reports', icon: FaChartBar },
    { path: '/admin/roles', label: 'Roles', icon: FaUserShield },
    { path: '/admin/permissions', label: 'Permissions', icon: FaLock },
    { path: '/admin/user-permissions', label: 'User Permissions', icon: FaUserCog },
    { path: '/admin/audit-log', label: 'Audit Log', icon: FaClock },
    { path: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <FaUserShield className="text-lg text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">RBAC Admin</h1>
            <p className="text-xs text-slate-500">Permission Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`text-lg ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <button 
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <FaBars size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-slate-900">RBAC Administration</h2>
            <p className="text-sm text-slate-500">Manage roles, permissions and user assignments</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-600">
              A
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              Admin
            </span>
          </div>
        </header>

        {/* ✅ SỬA: Dùng Outlet thay vì children */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}