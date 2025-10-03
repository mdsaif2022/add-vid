"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function VideoPlayer({ src, onEnded, autoPlay = true, onPrev, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(Boolean(autoPlay));
  const [showHint, setShowHint] = useState<'back' | 'forward' | null>(null);
  const [userPaused, setUserPaused] = useState<boolean>(false);
  const [showUI, setShowUI] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [scrubbing, setScrubbing] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches, []);

  const isImage = useMemo(() => {
    if (!src) return false;
    // Detect Cloudinary image URLs and common image extensions
    if (/\/(image|raw)\/upload\//i.test(src)) return true;
    return /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i.test(src);
  }, [src]);

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec)) return '0:00';
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60) % 60;
    const h = Math.floor(sec / 3600);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
  };

  // Idle auto-hide for controls
  useEffect(() => {
    let timer: any;
    const show = () => {
      setShowUI(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowUI(false), 2000);
    };
    show();
    const container = containerRef.current;
    if (!container) return;
    const events: Array<keyof GlobalEventHandlersEventMap> = ['mousemove', 'touchstart', 'touchmove'];
    events.forEach((e) => container.addEventListener(e, show as any));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => container.removeEventListener(e, show as any));
    };
  }, [src]);

  const play = useCallback(async () => {
    if (isImage) return; // no-op for images
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
      setUserPaused(false);
    } catch {
      video.setAttribute('controls', 'true');
    }
  }, [isImage]);

  const pause = useCallback(() => {
    if (isImage) return; // no-op for images
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    setUserPaused(true);
  }, [isImage]);

  const togglePlay = useCallback(() => {
    if (isImage) return; // no-op for images
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play(); else pause();
  }, [play, pause, isImage]);

  const seekBy = useCallback((deltaSeconds: number) => {
    if (isImage) return; // no-op for images
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min((video.currentTime || 0) + deltaSeconds, video.duration || Number.MAX_SAFE_INTEGER));
    video.currentTime = next;
  }, [isImage]);

  const onDoubleClickLeft = useCallback(() => {
    if (isImage) return;
    seekBy(-5);
    setShowHint('back');
    setTimeout(() => setShowHint(null), 400);
  }, [seekBy, isImage]);

  const onDoubleClickRight = useCallback(() => {
    if (isImage) return;
    seekBy(5);
    setShowHint('forward');
    setTimeout(() => setShowHint(null), 400);
  }, [seekBy, isImage]);

  // Update time/duration for videos only
  useEffect(() => {
    if (isImage) return;
    const v = videoRef.current;
    if (!v) return;
    const time = () => setCurrentTime(v.currentTime || 0);
    const meta = () => setDuration(v.duration || 0);
    v.addEventListener('timeupdate', time);
    v.addEventListener('loadedmetadata', meta);
    return () => {
      v.removeEventListener('timeupdate', time);
      v.removeEventListener('loadedmetadata', meta);
    };
  }, [src, isImage]);

  useEffect(() => {
    // Reset user pause flag when the source changes
    setUserPaused(false);
  }, [src]);

  useEffect(() => {
    if (isImage) return; // no autoplay for images
    const video = videoRef.current;
    if (!video) return;
    const onCanPlay = () => {
      if (autoPlay && !userPaused) {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {
            video.setAttribute('controls', 'true');
          });
        }
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [src, autoPlay, userPaused, isImage]);

  const download = useCallback(() => {
    const a = document.createElement('a');
    a.href = src;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [src]);

  const share = useCallback(async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?media=${encodeURIComponent(src)}` : src;
    const text = 'Check out this media!';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Media', text, url });
        return;
      }
    } catch {}
    setShowShare(true);
  }, [src]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return src;
    return `${window.location.origin}${window.location.pathname}?media=${encodeURIComponent(src)}`;
  }, [src]);

  const openMessenger = () => {
    const deep = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
    const web = `https://m.me/?link=${encodeURIComponent(shareUrl)}`;
    window.location.href = deep;
    setTimeout(() => window.open(web, '_blank'), 400);
  };

  const openTelegram = () => {
    const deep = `tg://msg_url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check this out')}`;
    const web = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Check%20this%20out`;
    window.location.href = deep;
    setTimeout(() => window.open(web, '_blank'), 400);
  };

  // Scrubbing
  const onScrub = (value: number) => {
    if (isImage) return;
    const v = videoRef.current;
    if (!v) return;
    const newTime = Math.max(0, Math.min(value, duration || 0));
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-10 flex items-center justify-center bg-black select-none">
      {/* Media */}
      {isImage ? (
        <img src={src} alt="Media" className="h-full w-full object-contain" />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          src={src}
          playsInline
          autoPlay={autoPlay}
          onEnded={onEnded}
          preload="auto"
          muted
          onClick={togglePlay}
        />
      )}

      {/* Left/Right gesture layers for dblclick seek (video only) */}
      {!isImage && (
        <div className="absolute inset-0 grid grid-cols-2">
          <button aria-label="seek back" className="h-full w-full" onDoubleClick={onDoubleClickLeft} />
          <button aria-label="seek forward" className="h-full w-full" onDoubleClick={onDoubleClickRight} />
        </div>
      )}

      {/* Top gradient overlay (branding space) */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent transition-opacity ${showUI ? 'opacity-100' : 'opacity-0'}`} />

      {/* Bottom controls with gradient */}
      <div className={`absolute inset-x-0 bottom-0 pb-4 pt-10 bg-gradient-to-t from-black/70 to-transparent transition-opacity ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4">
          {/* Progress + time (video only) */}
          {!isImage && (
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-white/80 min-w-[44px] text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(0, duration || 0)}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => onScrub(parseFloat(e.target.value))}
                onMouseDown={() => setScrubbing(true)}
                onMouseUp={() => setScrubbing(false)}
                onTouchStart={() => setScrubbing(true)}
                onTouchEnd={() => setScrubbing(false)}
                className="w-full accent-white/90 [--tw-shadow:0_0_0]"
              />
              <span className="text-xs tabular-nums text-white/80 min-w-[44px]">{formatTime(duration)}</span>
            </div>
          )}

          {/* Main controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isImage && (
                <button
                  onClick={togglePlay}
                  className="rounded-full bg-white/15 px-4 py-2 text-white backdrop-blur hover:bg-white/25 active:scale-95"
                >
                  {isPlaying ? (isMobile ? '❚❚' : 'Pause') : (isMobile ? '►' : 'Play')}
                </button>
              )}
              {!isImage && (
                <>
                  <button
                    onClick={() => seekBy(-5)}
                    className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                  >
                    -5s
                  </button>
                  <button
                    onClick={() => seekBy(5)}
                    className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                  >
                    +5s
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                className="rounded bg-white/15 px-3 py-2 text-white backdrop-blur hover:bg-white/25"
              >
                Prev
              </button>
              <button
                onClick={onNext}
                className="rounded bg-white/15 px-3 py-2 text-white backdrop-blur hover:bg-white/25"
              >
                Next
              </button>
              <button
                onClick={download}
                className="rounded bg-white/15 px-3 py-2 text-white backdrop-blur hover:bg-white/25"
              >
                Download
              </button>
              <button
                onClick={share}
                className="rounded bg-white/15 px-3 py-2 text-white backdrop-blur hover:bg-white/25"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seek hints for video only */}
      {!isImage && showHint === 'back' && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 rounded bg-white/10 px-3 py-1 text-white text-sm">-5s</div>
      )}
      {!isImage && showHint === 'forward' && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 rounded bg-white/10 px-3 py-1 text-white text-sm">+5s</div>
      )}

      {/* Share fallback panel */}
      {showShare && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/50" onClick={() => setShowShare(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold">Share</h3>
              <button className="text-sm" onClick={() => setShowShare(false)}>Close</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <a className="rounded bg-blue-600 px-3 py-2 text-white text-center" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a>
              <button className="rounded bg-blue-500 px-3 py-2 text-white text-center" onClick={openMessenger}>Messenger</button>
              <a className="rounded bg-green-500 px-3 py-2 text-white text-center" href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <button className="rounded bg-cyan-500 px-3 py-2 text-white text-center" onClick={openTelegram}>Telegram</button>
              <a className="rounded bg-black px-3 py-2 text-white text-center" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check%20this%20out`} target="_blank" rel="noreferrer">X</a>
              <a className="rounded bg-indigo-600 px-3 py-2 text-white text-center" href={`mailto:?subject=Check%20this%20media&body=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Email</a>
              <button className="rounded bg-pink-500 px-3 py-2 text-white text-center" onClick={() => navigator.clipboard.writeText(shareUrl)}>Instagram (Copy)</button>
              <button className="rounded bg-rose-500 px-3 py-2 text-white text-center" onClick={() => navigator.clipboard.writeText(shareUrl)}>TikTok (Copy)</button>
              <button className="rounded bg-gray-200 px-3 py-2 text-center" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy link</button>
            </div>
            <p className="mt-3 text-xs text-gray-500">Images now display inline. Some apps require native install for deep links. Use Copy for Instagram/TikTok.</p>
          </div>
        </div>
      )}
    </div>
  );
}

