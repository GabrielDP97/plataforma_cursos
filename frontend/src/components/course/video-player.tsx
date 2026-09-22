import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { progressApi } from '../../api/modules/progress';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  lessonId: string;
  initialPosition?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
  src,
  poster,
  lessonId,
  initialPosition = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Resume from saved position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasResumed) return;

    const handleLoadedMetadata = () => {
      if (initialPosition > 0 && video.currentTime < initialPosition) {
        video.currentTime = initialPosition;
      }
      setHasResumed(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [initialPosition, hasResumed]);

  // Save position every 10 seconds
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    saveIntervalRef.current = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        progressApi.updateVideoProgress(lessonId, {
          positionSeconds: video.currentTime,
          durationSeconds: video.duration,
        }).catch(() => {
          // Silently fail - will retry on next interval
        });
      }
    }, 10000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [lessonId]);

  // Auto-mark complete at 90%
  useEffect(() => {
    if (completed || !onComplete) return;

    const video = videoRef.current;
    if (!video || !duration) return;

    const threshold = duration * 0.9;
    if (currentTime >= threshold) {
      setCompleted(true);
      onComplete();
    }
  }, [currentTime, duration, completed, onComplete]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (onProgress && video.duration) {
      onProgress(video.currentTime / video.duration);
    }
  }, [onProgress]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Save position on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 0 && video.duration > 0) {
        progressApi.updateVideoProgress(lessonId, {
          positionSeconds: video.currentTime,
          durationSeconds: video.duration,
        }).catch(() => {});
      }
    };
  }, [lessonId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if video container is focused or no input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 5;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 5;
          }
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute]);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full cursor-pointer"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onClick={togglePlay}
        preload="metadata"
      >
        <track kind="captions" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Reproducir"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="h-8 w-8 text-gray-900 ml-1" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Progress bar */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full cursor-pointer appearance-none rounded-full bg-white/30 h-1 accent-blue-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            {/* Time */}
            <span className="text-xs text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 cursor-pointer appearance-none rounded-full bg-white/30 h-1 accent-blue-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
