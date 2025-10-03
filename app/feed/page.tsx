"use client";
import React, { useEffect, useMemo, useState } from 'react';
import FeedPost, { FeedItem } from '@/components/FeedPost';
import VideoPlayer from '@/components/VideoPlayer';
import AdModal from '@/components/AdModal';

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showAd, setShowAd] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/media', { cache: 'no-store' });
      const data = await res.json();
      const mapped: FeedItem[] = (data.items || []).map((r: any) => ({
        public_id: r.public_id,
        type: r.type,
        url: r.url,
        caption: r.caption,
        description: r.description,
      }));
      setItems(mapped);
    })();
  }, []);

  const current = useMemo(() => (openIdx != null ? items[openIdx] : null), [openIdx, items]);
  const isImage = useMemo(() => (current ? (current.type === 'image' || /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i.test(current.url)) : false), [current]);

  const next = () => {
    if (items.length === 0 || openIdx == null) return;
    // Show ad every transition
    setShowAd(true);
  };
  const prev = () => {
    if (openIdx == null) return;
    setShowAd(true);
  };

  const handleAdFinished = () => {
    setShowAd(false);
    if (openIdx == null) return;
    // Move index forward/backward; for simplicity always forward here
    const nextIdx = Math.min(items.length - 1, (openIdx || 0) + 1);
    setOpenIdx(nextIdx);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-3xl gap-4 p-4">
        {items.map((item, idx) => (
          <FeedPost key={item.public_id} item={item} onOpen={() => setOpenIdx(idx)} />
        ))}
        {items.length === 0 && (
          <p className="text-center py-20">No posts yet.</p>
        )}
      </div>

      {openIdx != null && current && !showAd && (
        <VideoPlayer
          src={current.url}
          onEnded={() => setShowAd(true)}
          onPrev={() => setOpenIdx(Math.max(0, openIdx - 1))}
          onNext={() => setShowAd(true)}
          autoPlay={!isImage}
        />
      )}

      {showAd && <AdModal onFinished={handleAdFinished} />}
    </main>
  );
}
