// src/components/common/CurrencySelector.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaExchangeAlt, FaUndo } from 'react-icons/fa';
import { useCurrency } from '../../context/CurrencyContext';

const CURRENCIES = [
  { code: 'VND', label: 'VND (Việt Nam Đồng)' },
  { code: 'USD', label: 'USD (US Dollar)' },
  { code: 'EUR', label: 'EUR (Euro)' },
  { code: 'GBP', label: 'GBP (British Pound)' },
  { code: 'AUD', label: 'AUD (Australian Dollar)' },
  { code: 'SGD', label: 'SGD (Singapore Dollar)' },
  { code: 'JPY', label: 'JPY (Japanese Yen)' },
  { code: 'CNY', label: 'CNY (Chinese Yuan)' },
];

interface CurrencySelectorProps {
  showRate?: boolean;
  showReset?: boolean;         // ✅ Thêm — có hiện nút reset không
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  showRate = true,
  showReset = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const {
    targetCurrency,
    setTargetCurrency,
    rate,
    loading,
    formatAmount,
    resetToLanguageDefault,
  } = useCurrency();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FaExchangeAlt className="text-[#49BBBD]" size={14} />

      <select
        value={targetCurrency}
        // ✅ User tự chọn → set userOverride = true (mặc định)
        onChange={(e) => setTargetCurrency(e.target.value)}
        className="h-9 rounded-xl border border-slate-200 px-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>

      {showRate && (
        <span className="text-xs text-slate-400">
          1 SGD = {loading ? '...' : `${formatAmount(rate)} ${targetCurrency}`}
        </span>
      )}

      {/* ✅ NEW: Nút reset về mặc định theo ngôn ngữ */}
      {showReset && (
        <button
          onClick={resetToLanguageDefault}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition"
          title={t('common.resetDefault') || 'Reset về mặc định'}
        >
          <FaUndo size={10} />
        </button>
      )}
    </div>
  );
};