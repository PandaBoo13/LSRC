// src/components/common/LanguageSwitcher/LanguageSwitcher.tsx
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

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language?.split('-')[0] || 'vi';
  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

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
    // ✅ Chỉ cần đổi language — CurrencyContext sẽ tự lắng nghe và cập nhật currency
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex h-11 items-center gap-2 rounded-full bg-cyan-50 px-3 text-cyan-600 transition hover:bg-cyan-100"
        title="Ngôn ngữ / Language"
      >
        <FaGlobe size={16} />
        <span className="text-sm font-semibold">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-bold uppercase">
          {current.code}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-xl border border-slate-100 py-1 z-50">
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
        </>
      )}
    </div>
  );
}