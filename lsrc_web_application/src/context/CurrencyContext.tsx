// src/context/CurrencyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getExchangeRate } from '../service/currencyService';

// ==================== MAPPING ====================

const LANGUAGE_CURRENCY_MAP: Record<string, string> = {
  vi: 'VND',
  en: 'USD',
};

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

const DEFAULT_CURRENCY = 'VND';
const DEFAULT_LOCALE = 'vi-VN';
const CURRENCY_STORAGE_KEY = 'selected_currency';

// ==================== TYPES ====================

interface CurrencyContextType {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  loading: boolean;
  error: string | null;
  locale: string;
  setTargetCurrency: (currency: string) => void;
  convert: (amount: number) => number;
  convertFormatted: (amount: number) => string;
  formatAmount: (amount: number) => string;
  refreshRate: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const baseCurrency = 'SGD';

  const currentLang = i18n.language?.split('-')[0] || 'vi';
  const locale = LANGUAGE_LOCALE_MAP[currentLang] || DEFAULT_LOCALE;

  // ✅ Init: đọc currency đã lưu, nếu chưa có → theo language
  const [targetCurrency, setTargetCurrencyState] = useState<string>(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved) return saved;
    return LANGUAGE_CURRENCY_MAP[currentLang] || DEFAULT_CURRENCY;
  });

  const [rate, setRate] = useState<number>(18500);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Track language trước đó — để phân biệt mount vs user đổi
  const prevLangRef = useRef<string>(currentLang);

  // ==================== FETCH RATE ====================

  const fetchRate = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getExchangeRate(baseCurrency, target);
      setRate(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch exchange rate');
      console.error('Lỗi CurrencyContext:', err);
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => {
    fetchRate(targetCurrency);
  }, [fetchRate, targetCurrency]);

  // ==================== ✅ LANGUAGE → CURRENCY ====================

  /**
   * Khi user ĐỔI language (không phải mount lần đầu):
   *   → Override currency theo language mới
   *   → Lưu vào localStorage
   *
   * Lần đầu mount: KHÔNG chạy (đã đọc từ localStorage ở useState init)
   */
  useEffect(() => {
    // Chỉ chạy khi language THỰC SỰ thay đổi (không phải mount lần đầu)
    if (prevLangRef.current === currentLang) return;

    prevLangRef.current = currentLang;

    const defaultCurrency = LANGUAGE_CURRENCY_MAP[currentLang] || DEFAULT_CURRENCY;

    console.log(`🌐 [Currency] Language changed → ${currentLang}, set currency = ${defaultCurrency}`);

    setTargetCurrencyState(defaultCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, defaultCurrency);
  }, [currentLang]);

  // ==================== SETTER ====================

  /**
   * User tự đổi currency (từ CurrencySelector)
   * → Lưu vào localStorage để giữ khi reload
   */
  const setTargetCurrency = useCallback((currency: string) => {
    setTargetCurrencyState(currency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, []);

  // ==================== CONVERT ====================

  const convert = useCallback((amount: number): number => {
    return amount * rate;
  }, [rate]);

  const convertFormatted = useCallback((amount: number): string => {
    const converted = amount * rate;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${converted.toLocaleString(locale)} ${targetCurrency}`;
    }
  }, [rate, targetCurrency, locale]);

  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [locale]);

  const refreshRate = useCallback(async () => {
    await fetchRate(targetCurrency);
  }, [fetchRate, targetCurrency]);

  // ==================== VALUE ====================

  const value = useMemo(() => ({
    baseCurrency,
    targetCurrency,
    rate,
    loading,
    error,
    locale,
    setTargetCurrency,
    convert,
    convertFormatted,
    formatAmount,
    refreshRate,
  }), [
    baseCurrency, targetCurrency, rate, loading, error, locale,
    setTargetCurrency, convert, convertFormatted, formatAmount, refreshRate,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};