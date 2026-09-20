// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },

    // Ngôn ngữ mặc định khi không detect được
    fallbackLng: 'vi',

    // Chỉ hỗ trợ 2 ngôn ngữ này
    supportedLngs: ['vi', 'en'],

    // Detect ngôn ngữ theo thứ tự:
    // 1. localStorage (nếu user đã chọn trước đó)
    // 2. navigator (ngôn ngữ browser)
    // 3. fallbackLng
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    debug: import.meta.env.DEV,
  });

export default i18n;