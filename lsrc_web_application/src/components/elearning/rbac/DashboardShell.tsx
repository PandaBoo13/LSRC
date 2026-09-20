// src/components/rbac/layout/DashboardShell.tsx
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaShieldAlt, FaKey, FaUserCheck, FaBars, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { useState } from 'react';

type NavItem = { label: string; path: string; icon: string; };
type Props = { children: ReactNode; role: string; title: string; subtitle: string; navItems: NavItem[]; };

const iconMap: Record<string, ReactNode> = {
  dashboard: <FaTachometerAlt size={18} />, users: <FaUsers size={18} />, 'user-cog': <FaUserCog size={18} />,
  shield: <FaShieldAlt size={18} />, key: <FaKey size={18} />, 'user-check': <FaUserCheck size={18} />,
  folder: <FaUsers size={18} />, chart: <FaTachometerAlt size={18} />, clock: <FaTachometerAlt size={18} />, settings: <FaTachometerAlt size={18} />,
};

export function DashboardShell({ children, role, title, subtitle, navItems }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600"><FaShieldAlt className="text-lg text-white" /></div>
          <div><h1 className="text-lg font-bold text-slate-900">Admin Panel</h1><p className="text-xs text-slate-500">{role}</p></div>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <span className={isActive ? 'text-cyan-600' : 'text-slate-400'}>{iconMap[item.icon] || <FaTachometerAlt size={18} />}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4"><button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"><FaSignOutAlt size={18} />Logout</button></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><FaBars size={20} /></button>
          <div className="hidden lg:block"><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div>
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-600">A</div></div>
        </header>
        <div className="border-b border-slate-200 bg-white px-6 py-4 lg:hidden"><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}