// src/hooks/useExchangeRate.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getExchangeRate, formatNumber, formatCurrency } from '../service/currencyService';

interface UseExchangeRateResult {
  rate: number;
  loading: boolean;
  error: string | null;
  convert: (amount: number) => number;
  convertReverse: (amount: number) => number;
  convertFormatted: (amount: number) => string;
  formatAmount: (amount: number) => string;
  refreshRate: () => Promise<void>;
  setTargetCurrency: (currency: string) => void;
}

/**
 * Hook quy đổi tiền tệ - Tùy chỉnh loại tiền tệ
 * 
 * @param baseCurrency - Tiền tệ gốc (mặc định: SGD)
 * @param initialTargetCurrency - Tiền tệ đích ban đầu (mặc định: VND)
 * 
 * @example
 * const { convert, convertFormatted, formatAmount, setTargetCurrency } = useExchangeRate('SGD', 'VND');
 * 
 * // Chuyển đổi SGD → VND (số thô)
 * convert(4905); // 90742500
 * 
 * // Chuyển đổi SGD → VND (đã format)
 * convertFormatted(4905); // "90.742.500 VND"
 * 
 * // Format số thô
 * formatAmount(90742500); // "90.742.500"
 * 
 * // Đổi sang USD
 * setTargetCurrency('USD');
 * convertFormatted(4905); // "3.629,70 USD"
 */
export const useExchangeRate = (
  baseCurrency: string = 'SGD',
  initialTargetCurrency: string = 'VND'
): UseExchangeRateResult => {
  const [targetCurrency, setTargetCurrency] = useState<string>(initialTargetCurrency);
  const [rate, setRate] = useState<number>(18500); // Default SGD → VND
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getExchangeRate(baseCurrency, target);
      setRate(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể lấy tỷ giá');
      console.error('Lỗi hook useExchangeRate:', err);
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  // Fetch tỷ giá khi base hoặc target thay đổi
  useEffect(() => {
    fetchRate(targetCurrency);
  }, [fetchRate, targetCurrency]);

  // Chuyển đổi số tiền (trả về số thô)
  const convert = useCallback((amount: number): number => {
    return amount * rate;
  }, [rate]);

  // Chuyển đổi ngược (từ target về base)
  const convertReverse = useCallback((amount: number): number => {
    return rate > 0 ? amount / rate : 0;
  }, [rate]);

  // Chuyển đổi và format kèm đơn vị tiền tệ
  const convertFormatted = useCallback((amount: number): string => {
    const converted = amount * rate;
    return formatCurrency(converted, targetCurrency);
  }, [rate, targetCurrency]);

  // Format số tiền với dấu chấm mỗi 3 đơn vị
  const formatAmount = useCallback((amount: number): string => {
    return formatNumber(amount);
  }, []);

  // Làm mới tỷ giá (xóa cache và fetch lại)
  const refreshRate = useCallback(async () => {
    await fetchRate(targetCurrency);
  }, [fetchRate, targetCurrency]);

  return useMemo(() => ({
    rate,
    loading,
    error,
    convert,
    convertReverse,
    convertFormatted,
    formatAmount,
    refreshRate,
    setTargetCurrency,
  }), [rate, loading, error, convert, convertReverse, convertFormatted, formatAmount, refreshRate, setTargetCurrency]);
};