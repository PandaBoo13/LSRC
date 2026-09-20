import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FaBars, FaBell, FaBookOpen, FaCertificate, FaChartLine,
  FaChevronRight, FaCog, FaCreditCard, FaEnvelope, FaGraduationCap,
  FaHeart, FaHome, FaLayerGroup, FaPlay, FaQuestionCircle,
  FaShieldAlt, FaShoppingCart, FaSignOutAlt, FaStar,
  FaTag, FaTimes, FaUser, FaUsers, FaClock, FaUserCheck, FaKey,
  FaComments,
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useChatWidget } from '../../../context/ChatContext';
import { NotificationBell } from '../../common/NotificationBell';
import type { NavItem } from '../../../data/elearning';

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  role: string;
  navItems: NavItem[];
  children: ReactNode;
  user?: {
    username?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    avatar?: string;
  };
};

const iconMap: Record<string, ReactNode> = {
  grid: <FaHome />, book: <FaBookOpen />, award: <FaCertificate />,
  card: <FaCreditCard />, user: <FaUser />, settings: <FaCog />,
  play: <FaPlay />, quiz: <FaQuestionCircle />, users: <FaUsers />,
  chart: <FaChartLine />, layers: <FaLayerGroup />, star: <FaStar />,
  tag: <FaTag />, heart: <FaHeart />, bell: <FaBell />,
  mail: <FaEnvelope />, shield: <FaShieldAlt />, key: <FaKey />,
  'user-check': <FaUserCheck />, clock: <FaClock />,
  logout: <FaSignOutAlt />,
};

const rootPaths = new Set(['/dashboard', '/instructor', '/admin']);

const getAvatarUrl = (path?: string, name: string = 'User') => {
  if (!path) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=49BBBD&color=fff`;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const cleanBase = API_BASE.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export function DashboardShell({
  title, subtitle = '', role, navItems, children, user: propUser,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  // ✅ FIX 1: Thêm totalUnread
  const { toggle: toggleChat, totalUnread } = useChatWidget();

  const currentUser = authUser || propUser;

  const displayName = (currentUser?.firstName || currentUser?.lastName)
    ? `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()
    : (currentUser?.username || 'Guest');

  const displayRole = currentUser?.role || role;

  const rawAvatar = (currentUser as any)?.avatarUrl || (currentUser as any)?.avatar;
  const avatarSrc = getAvatarUrl(rawAvatar, displayName);

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <>
      <Link to="/" className="flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-100">
          <FaGraduationCap />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">LSRC</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">{role}</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={rootPaths.has(item.to)}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300
              ${isActive ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-100' : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-600'}`
            }
          >
            <span className="text-base">{iconMap[item.icon]}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl bg-slate-900 p-5 text-white">
        <p className="font-semibold">Continue Learning</p>
        <p className="mt-2 text-sm text-slate-300">Resume your active lesson and continue improving your skills.</p>
        <Link to="/learn/react-foundations/props" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
          Open Lesson <FaChevronRight size={11} />
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MOBILE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-slate-200 bg-white p-5 transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-5 flex justify-end">
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><FaTimes /></button>
        </div>
        <SidebarContent />
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
        <SidebarContent />
      </aside>

      {/* CONTENT */}
      <div className="lg:pl-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="px-4 py-4 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <button onClick={() => setSidebarOpen(true)} className="mt-1 rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><FaBars /></button>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">{role}</p>
                  <h1 className="mt-1 truncate text-2xl font-bold text-slate-900 lg:text-3xl">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* ✅ FIX 2: Chat button + badge */}
                <button
                  onClick={toggleChat}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition hover:bg-cyan-100"
                  title="Chat"
                >
                  <FaComments />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </button>

                {/* Notification Bell - Component tách riêng */}
                <NotificationBell />

                {/* Cart */}
                <Link to="/cart" className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition hover:bg-cyan-100">
                  <FaShoppingCart />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 pr-3 transition hover:shadow-md"
                  >
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover border border-slate-100 bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=49BBBD&color=fff`;
                      }}
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                      <p className="text-xs text-slate-500 capitalize">{displayRole.replace('ROLE_', '')}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-100 py-2 z-50">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <FaUser size={14} /> Profile
                        </Link>
                        <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <FaCog size={14} /> Settings
                        </Link>
                        <hr className="my-1 border-slate-100" />
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left font-medium">
                          <FaSignOutAlt size={14} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}