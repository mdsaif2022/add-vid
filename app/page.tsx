"use client";
import React, { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import AdModal from '@/components/AdModal';
import Loader from '@/components/Loader';
import { useVideoAdCycle } from '@/hooks/useVideoAdCycle';

export default function HomePage() {
  const { phase, handleVideoEnd, handleAdFinished, playNextVideo, playPreviousVideo } = useVideoAdCycle();
  const [noVideos, setNoVideos] = useState(false);

  useEffect(() => {
    // Detect if loading persists implying no videos (fallback from API 404 handled in hook)
    const timer = setTimeout(() => {
      if (phase.type === 'loading') setNoVideos(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [phase.type]);

  if (noVideos) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <h1 className="text-xl font-semibold">No videos available</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full">
      {phase.type === 'loading' && <Loader />}
      {phase.type === 'video' && (
        <VideoPlayer 
          src={phase.src} 
          onEnded={handleVideoEnd} 
          onPrev={playPreviousVideo}
          onNext={playNextVideo}
        />
      )}
      {phase.type === 'ad' && <AdModal onFinished={handleAdFinished} />}
    </main>
  );
}

