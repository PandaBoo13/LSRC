// src/types/chapter.types.ts
import type { CourseResource } from './courseResource.types';

export interface Chapter {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  courseId: number;
  courseTitle?: string;
  // ✅ THAY ĐỔI: lessons → resources
  resources?: CourseResource[];
  totalResources?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterRequest {
  title: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateOrderRequest {
  idChapter: number;
  orderIndex: number;
}