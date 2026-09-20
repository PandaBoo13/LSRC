// src/types/auditLog.types.ts

export interface AuditLog {
  id: number;
  entityType: string;
  entityId?: number;
  action: string;
  summary?: string;
  oldValue?: string;
  newValue?: string;
  actorId: number;
  actorName?: string;
  actorRole?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogSearchRequest {
  entityType?: string;
  entityId?: number;
  action?: string;
  actorId?: number;
  actorRole?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}