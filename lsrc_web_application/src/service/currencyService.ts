// src/service/currencyService.ts
import axios from 'axios';

const EXCHANGE_API_BASE_URL = 'https://open.er-api.com/v6/latest';
const CACHE_KEY_PREFIX = 'exchange_rate';
const CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 giờ

// ==================== TYPES ====================

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
}

interface CacheData {
  rate: number;
  timestamp: number;
}

// ==================== HELPERS ====================

const getCacheKey = (from: string, to: string): string => {
  return `${CACHE_KEY_PREFIX}_${from}_${to}`;
};

const getFromCache = (from: string, to: string): number | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(from, to));
    if (!cached) return null;

    const { rate, timestamp } = JSON.parse(cached) as CacheData;
    
    // Kiểm tra cache còn hạn không
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return rate;
    }
  } catch (error) {
    console.error('Lỗi đọc cache:', error);
  }
  return null;
};

const saveToCache = (from: string, to: string, rate: number): void => {
  try {
    const cacheData: CacheData = {
      rate,
      timestamp: Date.now(),
    };
    localStorage.setItem(getCacheKey(from, to), JSON.stringify(cacheData));
  } catch (error) {
    console.error('Lỗi lưu cache:', error);
  }
};

// ==================== FORMAT HELPERS ====================

/**
 * Định dạng số tiền theo chuẩn Việt Nam
 * Ví dụ: 90742500 → 90.742.500
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Định dạng số tiền với đơn vị tiền tệ
 * Ví dụ: 90742500 → 90.742.500 VND
 */
export const formatCurrency = (value: number, currency: string = 'VND'): string => {
  return `${formatNumber(value)} ${currency}`;
};

/**
 * Định dạng số tiền đầy đủ
 * Ví dụ: 90742500 → 90.742.500,00 VND
 */
export const formatCurrencyFull = (value: number, currency: string = 'VND'): string => {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ` ${currency}`;
};

// ==================== API ====================

/**
 * Lấy tỷ giá giữa 2 tiền tệ (có cache 6 giờ)
 */
export const getExchangeRate = async (
  from: string,
  to: string
): Promise<number> => {
  // Kiểm tra cache trước
  const cachedRate = getFromCache(from, to);
  if (cachedRate !== null) {
    return cachedRate;
  }

  // Gọi API
  try {
    const response = await axios.get<ExchangeRateResponse>(
      `${EXCHANGE_API_BASE_URL}/${from}`
    );
    
    const rate = response.data.rates?.[to];
    
    if (!rate) {
      throw new Error(`Không tìm thấy tỷ giá ${from} → ${to}`);
    }

    // Lưu cache
    saveToCache(from, to, rate);
    
    return rate;
  } catch (error) {
    console.error(`Lỗi lấy tỷ giá ${from} → ${to}:`, error);
    
    // Fallback rates nếu API lỗi
    const fallbackRates: Record<string, number> = {
      'SGD_VND': 18500,
      'USD_VND': 25000,
      'EUR_VND': 27000,
      'GBP_VND': 32000,
      'AUD_VND': 16000,
      'JPY_VND': 165,
      'CNY_VND': 3450,
    };
    
    return fallbackRates[`${from}_${to}`] || 1;
  }
};

/**
 * Lấy tỷ giá SGD → VND
 */
export const getSGDToVNDRate = async (): Promise<number> => {
  return getExchangeRate('SGD', 'VND');
};

/**
 * Lấy tỷ giá USD → VND
 */
export const getUSDToVNDRate = async (): Promise<number> => {
  return getExchangeRate('USD', 'VND');
};

/**
 * Quy đổi tiền tệ (trả về số thô)
 */
export const convertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<number> => {
  const rate = await getExchangeRate(from, to);
  return amount * rate;
};

/**
 * Quy đổi tiền tệ (trả về số đã làm tròn 2 chữ số)
 */
export const convertCurrencyRounded = async (
  amount: number,
  from: string,
  to: string
): Promise<number> => {
  const result = await convertCurrency(amount, from, to);
  return Math.round(result * 100) / 100;
};

/**
 * Quy đổi SGD → VND (số thô)
 */
export const convertSGDToVND = async (amountSGD: number): Promise<number> => {
  const rate = await getSGDToVNDRate();
  return amountSGD * rate;
};

/**
 * Quy đổi SGD → VND (đã định dạng chuỗi)
 * Ví dụ: 4905 SGD → "90.742.500 VND"
 */
export const convertSGDToVNDFormatted = async (amountSGD: number): Promise<string> => {
  const result = await convertSGDToVND(amountSGD);
  return formatCurrency(result, 'VND');
};

/**
 * Quy đổi SGD → VND (đã định dạng đầy đủ với 2 số thập phân)
 * Ví dụ: 4905 SGD → "90.742.500,00 VND"
 */
export const convertSGDToVNDFormattedFull = async (amountSGD: number): Promise<string> => {
  const result = await convertSGDToVND(amountSGD);
  return formatCurrencyFull(result, 'VND');
};

/**
 * Xóa cache (khi cần cập nhật tỷ giá ngay)
 */
export const clearExchangeRateCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};