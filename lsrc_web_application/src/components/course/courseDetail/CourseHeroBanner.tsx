// src/pages/elearning/StudentPages/components/CourseDetail/CourseHeroBanner.tsx
import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { getImageUrl, getImageDimensions, getImageClass, type ImageDimensions } from '../../../utils/imageHelper';

interface CourseHeroBannerProps {
  thumbnailUrl?: string;
  title: string;
  onBack: () => void;
}

export function CourseHeroBanner({ thumbnailUrl, title, onBack }: CourseHeroBannerProps) {
  // ✅ Kiểm tra kích thước ảnh
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const imageUrl = getImageUrl(thumbnailUrl);

  useEffect(() => {
    if (imageUrl && imageUrl !== '/placeholder.jpg') {
      getImageDimensions(imageUrl)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [imageUrl]);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[440px] bg-slate-900 overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className={`${getImageClass(imageDimensions?.orientation)} opacity-80`}
        onError={(e) => { 
          (e.target as HTMLImageElement).src = '/placeholder.jpg'; 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold backdrop-blur-md shadow-sm transition cursor-pointer"
        >
          <FaArrowLeft size={10} /> Back
        </button>
      </div>
    </div>
  );
}