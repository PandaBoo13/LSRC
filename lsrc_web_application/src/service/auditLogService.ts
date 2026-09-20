// src/service/auditLogService.ts
import api from '../api/axiosConfig';
import type { RequestResponse, PageResponse } from '../types/course.types';
import type { AuditLog, AuditLogSearchRequest } from '../types/auditLog.types';

/**
 * Tìm kiếm & filter audit logs
 */
export const searchAuditLogs = async (params?: AuditLogSearchRequest): Promise<PageResponse<AuditLog>> => {
  const response = await api.get<RequestResponse<PageResponse<AuditLog>>>('/audit-logs', { params });
  return response.data.data;
};

/**
 * Xem log theo entity (vd: COURSE/42)
 */
export const getAuditLogsByEntity = async (
  entityType: string,
  entityId: number,
  page = 0,
  size = 20
): Promise<PageResponse<AuditLog>> => {
  const response = await api.get<RequestResponse<PageResponse<AuditLog>>>(
    `/audit-logs/entity/${entityType}/${entityId}`,
    { params: { page, size } }
  );
  return response.data.data;
};

/**
 * Xem log theo người dùng
 */
export const getAuditLogsByActor = async (
  actorId: number,
  page = 0,
  size = 20
): Promise<PageResponse<AuditLog>> => {
  const response = await api.get<RequestResponse<PageResponse<AuditLog>>>(
    `/audit-logs/actor/${actorId}`,
    { params: { page, size } }
  );
  return response.data.data;
};

/**
 * Dọn dẹp log cũ (Admin only)
 */
export const cleanOldAuditLogs = async (daysOld = 90): Promise<void> => {
  await api.delete('/audit-logs/clean', { params: { daysOld } });
};