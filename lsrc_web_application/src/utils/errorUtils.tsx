// src/utils/errorUtils.ts

/**
 * Lấy message lỗi từ response backend
 * Dùng cho TẤT CẢ API trong toàn bộ app
 * 
 * @param error - Error từ catch
 * @param fallback - Message mặc định nếu không có lỗi
 * @returns Message lỗi hiển thị cho user
 * 
 * Cách dùng:
 * catch (err) {
 *   setError(getErrorMessage(err, 'Đăng nhập thất bại'));
 * }
 */
export const getErrorMessage = (error: any, fallback?: string): string => {
  // ✅ Ưu tiên 1: Backend error response với field "error"
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // ✅ Ưu tiên 2: Backend error response với field "message"
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // ✅ Ưu tiên 3: response.data là string (VD: "Bad Request")
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }

  // Network error
  if (error?.message === 'Network Error') {
    return 'Không thể kết nối đến server';
  }

  // Axios error message (chỉ khi không có response từ backend)
  if (error?.message && !error?.response) {
    return error.message;
  }

  // Fallback
  return fallback || 'Có lỗi xảy ra, vui lòng thử lại.';
};