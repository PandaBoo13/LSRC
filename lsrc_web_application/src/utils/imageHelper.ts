// ============================================
// src/utils/imageHelper.ts - FIXED
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ==================== IMAGE URL ====================

/**
 * Lấy URL đầy đủ của ảnh
 * @param url - Đường dẫn ảnh (có thể là relative path hoặc absolute URL)
 * @param fallback - Ảnh mặc định nếu url null/undefined
 * @returns URL đầy đủ
 */
export const getImageUrl = (url?: string | null, fallback: string = '/placeholder.jpg'): string => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url}`;
};

/**
 * Lấy URL avatar, có fallback riêng cho avatar
 */
export const getAvatarUrl = (url?: string | null): string => {
  return getImageUrl(url, 'https://i.pravatar.cc/180?img=8');
};

// ==================== BACKGROUND HELPERS ====================

/**
 * Lấy CSS style cho background của thumbnail
 * Hỗ trợ: GRADIENT, PATTERN, IMAGE, SOLID
 * 
 * @param backgroundType - Loại background: GRADIENT, PATTERN, IMAGE, SOLID
 * @param backgroundThumbnail - Giá trị background (gradient CSS, URL, màu)
 * @returns React.CSSProperties - Style object
 */
export const getBackgroundStyle = (
  backgroundType?: string | null,
  backgroundThumbnail?: string | null
): React.CSSProperties => {
  if (!backgroundType || !backgroundThumbnail) return {};

  switch (backgroundType.toUpperCase()) {
    case 'IMAGE':
      // Background là ảnh
      return {
        backgroundImage: `url(${getImageUrl(backgroundThumbnail)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };

    case 'GRADIENT':
      // Background là gradient CSS (ví dụ: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
      return {
        background: backgroundThumbnail,
      };

    case 'PATTERN':
      // Background là pattern CSS
      return {
        background: backgroundThumbnail,
      };

    case 'SOLID':
      // Background là màu đơn
      return {
        backgroundColor: backgroundThumbnail,
      };

    default:
      return {};
  }
};

/**
 * Kiểm tra course có background không
 */
export const hasBackground = (backgroundType?: string | null, backgroundThumbnail?: string | null): boolean => {
  return Boolean(backgroundType && backgroundThumbnail);
};

/**
 * Lấy class CSS cho container ảnh có background
 * @returns class CSS
 */
export const getImageContainerClass = (hasBg: boolean): string => {
  return hasBg
    ? 'relative overflow-hidden bg-cover bg-center'
    : 'relative overflow-hidden';
};

// ==================== IMAGE DIMENSIONS ====================

export interface ImageDimensions {
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  aspectRatio: number;
}

/**
 * Lấy kích thước thực của ảnh từ URL
 */
export const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      
      let orientation: 'landscape' | 'portrait' | 'square';
      if (aspectRatio > 1.1) {
        orientation = 'landscape';
      } else if (aspectRatio < 0.9) {
        orientation = 'portrait';
      } else {
        orientation = 'square';
      }
      
      resolve({ width, height, orientation, aspectRatio });
    };
    
    img.onerror = () => {
      reject(new Error('Không thể tải ảnh để kiểm tra kích thước'));
    };
    
    img.src = url;
  });
};

/**
 * Lấy class CSS phù hợp cho ảnh dựa trên orientation
 */
export const getImageClass = (orientation?: 'landscape' | 'portrait' | 'square'): string => {
  switch (orientation) {
    case 'portrait':
      // Ảnh dọc → full height, object-contain, căn giữa
      return 'w-auto h-full object-contain mx-auto';
    case 'square':
      // Ảnh vuông → full cả 2
      return 'w-full h-full object-cover';
    case 'landscape':
    default:
      // Ảnh ngang → full width
      return 'w-full h-full object-cover';
  }
};

/**
 * Kiểm tra ảnh có phải landscape (ngang) không
 */
export const isLandscape = async (url: string): Promise<boolean> => {
  try {
    const dims = await getImageDimensions(url);
    return dims.orientation === 'landscape';
  } catch {
    return false;
  }
};

/**
 * Kiểm tra ảnh có phải portrait (dọc) không
 */
export const isPortrait = async (url: string): Promise<boolean> => {
  try {
    const dims = await getImageDimensions(url);
    return dims.orientation === 'portrait';
  } catch {
    return false;
  }
};