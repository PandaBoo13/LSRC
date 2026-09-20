
// src/components/common/LanguageSwitcher/FloatingLanguageSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaCheck } from 'react-icons/fa';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const LANGUAGES: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function FloatingLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language?.split('-')[0] || 'vi';
  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="fixed bottom-6 left-6 z-50">
      {/* Dropdown hiện LÊN TRÊN nút */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-white shadow-2xl border border-slate-100 py-1 z-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold transition ${
                current.code === lang.code
                  ? 'bg-cyan-50 text-cyan-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {current.code === lang.code && (
                <FaCheck size={11} className="text-cyan-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Nút nổi */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex h-14 items-center gap-2 rounded-full bg-[#49BBBD] text-white shadow-lg px-4 transition-all hover:bg-[#3ca3a5] hover:scale-105 active:scale-95"
        title="Ngôn ngữ / Language"
      >
        <FaGlobe size={20} />
        <span className="text-sm font-bold">{current.flag}</span>
        <span className="text-xs font-bold uppercase">{current.code}</span>
      </button>
    </div>
  );
}