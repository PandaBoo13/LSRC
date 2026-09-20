export interface Category {
  id: string;
  idCategory?: string;
  name: string;
  slug: string;
  description?: string;
  level: number;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  parentId?: string | null;
}

// Response wrapper từ backend khi thành công
export interface RequestResponse<T = any> {
  data: T;
  message: string;
}

// Response wrapper từ backend khi lỗi
export interface ExceptionResponse {
  status: string;
  timestamp: string;
  message: string;
}