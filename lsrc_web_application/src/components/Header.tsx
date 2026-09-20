import { useState, useRef } from 'react';
import { FaBars, FaTimes, FaChevronDown, FaGlobeAmericas, FaFlag, FaSearch, FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [mobileStudyOpen, setMobileStudyOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isAuthenticated } = useAuth();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStudyOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setStudyOpen(false), 150);
  };

  const menus = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses2' },
    // ❌ COMMENT: ẨN Blog
    // { name: 'Blog', path: '/blog' },
    // ❌ COMMENT: ẨN Help
    // { name: 'Help', path: '/help' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <header className={`top-0 left-0 right-0 z-50 transition-all duration-300
      ${isHomePage ? 'absolute bg-transparent' : 'sticky border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'}
    `}>
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105">
              <div className={`absolute inset-0 rotate-45 rounded-lg border-2 transition-colors ${isHomePage ? 'border-white' : 'border-cyan-500'}`} />
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${isHomePage ? 'text-white' : 'text-slate-800'}`}>L</span>
            </div>
            <span className={`hidden md:block text-sm font-bold ${isHomePage ? 'text-white' : 'text-slate-800'}`}>
              LEARNING & STUDY RESOURCE CENTER
            </span>
            <span className={`md:hidden text-sm font-bold ${isHomePage ? 'text-white' : 'text-slate-800'}`}>
              LSRC
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-auto mr-6">
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button onClick={() => setStudyOpen(!studyOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-semibold whitespace-nowrap transition-colors
                  ${isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600'}`}>
                Study <FaChevronDown size={10} className={`transition-transform duration-200 ${studyOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 transition-all duration-200 z-50
                ${studyOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <Link to="/study-abroad" onClick={() => setStudyOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-600">
                  <FaGlobeAmericas className="text-cyan-500" />
                  <div><div className="font-semibold text-sm">Study Abroad</div><div className="text-xs text-gray-500">Du học quốc tế</div></div>
                </Link>
                <Link to="/study-in-vietnam" onClick={() => setStudyOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-600">
                  <FaFlag className="text-red-500" />
                  <div><div className="font-semibold text-sm">Study in Vietnam</div><div className="text-xs text-gray-500">Du học tại Việt Nam</div></div>
                </Link>
              </div>
            </div>
            {menus.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.name} to={item.path}
                  className={`rounded-lg px-3 py-2 text-[15px] font-semibold whitespace-nowrap transition-colors
                    ${isHomePage ? 'text-white hover:bg-white/10' : active ? 'text-cyan-600 bg-cyan-50' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600'}`}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <Link to="/search"
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap transition
                ${isHomePage ? 'border-white/30 text-white/90 hover:bg-white/10' : 'border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600'}`}>
              <FaSearch size={14} /> <span className="hidden xl:inline">Search</span>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition
                ${isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100 hover:text-cyan-600'}`}>
              <FaShoppingCart size={18} />
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className={`rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5
                  ${isHomePage ? 'bg-white text-slate-700 hover:shadow-lg' : 'border border-cyan-500 bg-white text-cyan-600 hover:bg-cyan-500 hover:text-white'}`}>Login</Link>
                <Link to="/register" className={`rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5
                  ${isHomePage ? 'bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-cyan-600' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}>Sign Up</Link>
              </>
            ) : (
              // ❌ COMMENT: ẨN nút Browse Courses khi đã đăng nhập
              // <Link to="/courses" className={`rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5
              //   ${isHomePage ? 'bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-cyan-600' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}>
              //   Browse Courses
              // </Link>
              null
            )}
          </div>

          <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-lg transition ${isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'}`}>
            {open ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`overflow-hidden transition-all duration-300 lg:hidden ${open ? 'mt-4 max-h-[800px]' : 'max-h-0'}`}>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex flex-col gap-2">
              <button onClick={() => setMobileStudyOpen(!mobileStudyOpen)} className="w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <span className="flex items-center gap-3"><FaGlobeAmericas className="text-cyan-500" /> Study</span>
                <FaChevronDown size={12} className={`transition-transform duration-200 ${mobileStudyOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${mobileStudyOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                <Link to="/study-abroad" onClick={() => { setOpen(false); setMobileStudyOpen(false); }} className="flex items-center gap-3 rounded-xl px-6 py-3 text-sm text-slate-600 hover:bg-slate-50"><FaGlobeAmericas className="text-cyan-500" /> Study Abroad</Link>
                <Link to="/study-in-vietnam" onClick={() => { setOpen(false); setMobileStudyOpen(false); }} className="flex items-center gap-3 rounded-xl px-6 py-3 text-sm text-slate-600 hover:bg-slate-50"><FaFlag className="text-red-500" /> Study in Vietnam</Link>
              </div>
              {menus.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{item.name}</Link>
              ))}
              <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FaShoppingCart className="text-slate-500" /> Cart
              </Link>
              <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="rounded-full bg-cyan-500 py-3 text-center text-sm font-semibold text-white">Login</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="rounded-full border border-cyan-500 py-3 text-center text-sm font-semibold text-cyan-600">Sign Up</Link>
                  </>
                ) : (
                  // ❌ COMMENT: Ẩn nút Browse Courses mobile khi đã đăng nhập
                  // <Link to="/courses" onClick={() => setOpen(false)} className="rounded-full bg-cyan-500 py-3 text-center text-sm font-semibold text-white">Browse Courses</Link>
                  null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}