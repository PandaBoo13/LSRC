// src/components/elearning/learning/VideoPlayer.tsx
import { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute, FaExclamationTriangle } from 'react-icons/fa';
import type { CourseResource } from '../../../types/courseResource.types';

const BACKEND_URL = 'http://localhost:8080';

type Props = {
  resources: CourseResource[];
  lessonTitle: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onProgress?: (percent: number) => void;
  completeThreshold?: number;
};

export function VideoPlayer({ 
  resources, lessonTitle, 
  onPlay, onPause, onTimeUpdate, onEnded,
  onProgress,
  completeThreshold = 10
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredComplete = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoResource = resources.find(r => r.resourceType === 'VIDEO');

  useEffect(() => {
    hasTriggeredComplete.current = false;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(null);
  }, [videoResource?.fileUrl]);

  const getVideoUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(err => {
        console.error('Video play failed:', err);
        setVideoError('Không thể phát video. Định dạng có thể không được hỗ trợ.');
      });
      setIsPlaying(true);
      onPlay?.();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ✅ Đảm bảo gọi onProgress ít nhất 1 lần
  const triggerComplete = (percent: number) => {
    if (!hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      console.log('🟢 VideoPlayer triggerComplete:', percent, '%');
      onProgress?.(percent);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    
    console.log('🔴 timeupdate - current:', current, 'duration:', dur);
    
    if (isNaN(dur) || dur === 0) return;
    
    const percent = (current / dur) * 100;
    setCurrentTime(current);
    setDuration(dur);
    setProgress(percent);
    onTimeUpdate?.(current, dur);

    if (percent >= completeThreshold) {
      triggerComplete(Math.round(percent));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = percent * duration;
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoError = () => {
    const error = videoRef.current?.error;
    let message = 'Không thể tải video bài giảng.';
    if (error) {
      switch (error.code) {
        case 1: message = 'Tải video bị hủy bỏ.'; break;
        case 2: message = 'Lỗi kết nối mạng khi tải video.'; break;
        case 3: message = 'Lỗi giải mã video.'; break;
        case 4: message = 'Định dạng video không hỗ trợ hoặc tệp không tồn tại.'; break;
      }
    }
    setVideoError(message);
  };

  if (!videoResource) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-2xl">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl text-cyan-400 border border-cyan-500/20">
          🎬
        </div>
        <h3 className="text-lg font-semibold text-white">Chưa có video cho bài học này</h3>
        <p className="mt-1 text-sm text-slate-400">Giảng viên sẽ sớm cập nhật video bài giảng.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={getVideoUrl(videoResource.fileUrl || '')}
        className="h-full w-full cursor-pointer object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          console.log('🔴 Video ENDED!');
          setIsPlaying(false);
          triggerComplete(100);
          onEnded?.();
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            console.log('🟢 Video metadata loaded - duration:', videoRef.current.duration);
            setDuration(videoRef.current.duration);
            setVideoError(null);
          }
        }}
        onError={handleVideoError}
        onClick={togglePlay}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Error View */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-sm z-30">
          <FaExclamationTriangle className="mb-3 text-4xl text-amber-500" />
          <p className="text-lg font-semibold text-white">Lỗi phát video</p>
          <p className="mt-1 mb-4 text-sm text-slate-400">{videoError}</p>
          <button
            onClick={() => { setVideoError(null); if (videoRef.current) videoRef.current.load(); }}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Play Overlay Button */}
      {!isPlaying && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all z-10 pointer-events-none">
          <button 
            onClick={togglePlay}
            className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-2xl text-white shadow-xl shadow-cyan-500/30 hover:scale-110 hover:bg-cyan-400 transition-all"
          >
            <FaPlay className="ml-1" />
          </button>
        </div>
      )}

      {/* Top Gradient Overlay & Title */}
      <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 pointer-events-none ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Đang phát</span>
        <h2 className="mt-1 text-lg font-bold text-white line-clamp-1 drop-shadow-md">{lessonTitle}</h2>
      </div>

      {/* Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-4 pt-12 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div 
          className="group/progress relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 hover:h-2.5 transition-all"
          onClick={handleSeek}
        >
          <div 
            className="relative h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          >
            <div className="absolute -right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay} 
              className="text-slate-200 hover:text-cyan-400 transition-colors p-1"
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </button>
            <button 
              onClick={toggleMute} 
              className="text-slate-200 hover:text-cyan-400 transition-colors p-1"
            >
              {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            </button>
            <span className="text-xs font-mono text-slate-300 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button 
            onClick={toggleFullscreen} 
            className="text-slate-200 hover:text-cyan-400 transition-colors p-1"
          >
            {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}