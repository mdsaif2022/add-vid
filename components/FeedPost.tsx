"use client";
import React, { useEffect, useRef } from 'react';

export type FeedItem = {
  public_id: string;
  type: 'image' | 'video' | string;
  url: string;
  caption?: string;
  description?: string;
};

export default function FeedPost({ item, onOpen }: { item: FeedItem; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (item.type !== 'video') return;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            try {
              video.muted = true;
              video.playsInline = true as any;
              await video.play();
            } catch {}
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [item.type]);

  const isImage = item.type === 'image' || /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i.test(item.url);

  return (
    <div ref={containerRef} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="mb-2">
        <p className="text-sm font-semibold line-clamp-1">{item.caption || 'Untitled'}</p>
        {item.description && (
          <p className="text-xs text-white/70 line-clamp-2">{item.description}</p>
        )}
      </div>
      <button onClick={onOpen} className="block w-full overflow-hidden rounded-lg">
        {isImage ? (
          <img src={item.url} alt={item.caption || 'image'} className="h-80 w-full object-cover" />
        ) : (
          <video ref={videoRef} src={item.url} className="h-80 w-full object-cover" loop muted playsInline />
        )}
      </button>
    </div>
  );
}
