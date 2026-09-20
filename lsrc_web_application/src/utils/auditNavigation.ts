// src/utils/auditNavigation.ts

const ENTITY_LABELS: Record<string, string> = {
  COURSE: 'khóa học',
  LESSON: 'bài học',
  CHAPTER: 'chương',
  EXAM: 'bài kiểm tra',
  QUESTION: 'câu hỏi',
  ENROLLMENT: 'đăng ký',
  USER: 'người dùng',
  CATEGORY: 'danh mục',
};

export function getEntityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] || entityType.toLowerCase();
}

export function getEntityLink(entityType: string, entityId?: number): string | null {
  if (!entityId) return null;

  switch (entityType) {
    case 'COURSE':
      return `/admin/courses/${entityId}/preview`;
    case 'USER':
      return `/admin/users`;
    case 'CATEGORY':
      return `/admin/categories`;
    default:
      return null;
  }
}