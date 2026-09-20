// src/types/wishlist.types.ts

export interface WishlistResponse {
  id: number;
  accountId: number;  // ✅ THÊM
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl: string | null;  // ✅ ĐỔI TÊN: courseThumbnail → courseThumbnailUrl
  coursePrice: number;  // ✅ ĐỔI TÊN: price → coursePrice
  courseOldPrice: number | null;  // ✅ ĐỔI TÊN: oldPrice → courseOldPrice
  courseIsFree: boolean;  // ✅ ĐỔI TÊN: isFree → courseIsFree
  courseStatus: string;  // ✅ THÊM: trạng thái khóa học
  addedAt: string;
}