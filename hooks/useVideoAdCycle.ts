"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Video = { public_id: string; url: string; playback_url: string };

type Phase =
  | { type: 'loading' }
  | { type: 'video'; countInSequence: number; src: string }
  | { type: 'ad' };

export function useVideoAdCycle() {
  const [phase, setPhase] = useState<Phase>({ type: 'loading' });
  const sequenceRef = useRef<{ nextIsSingle: boolean; videosAfterAd: number }>({
    nextIsSingle: true,
    videosAfterAd: 1,
  });
  const historyRef = useRef<string[]>([]);
  const suppressHistoryPushRef = useRef<boolean>(false);

  const fetchRandomVideo = useCallback(async (): Promise<Video | null> => {
    const res = await fetch('/api/videos', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Video;
  }, []);

  const setVideoPhase = useCallback((src: string, count: number, pushToHistory: boolean) => {
    if (pushToHistory) historyRef.current.push(src);
    setPhase({ type: 'video', countInSequence: count, src });
  }, []);

  const playNextVideo = useCallback(async () => {
    const data = await fetchRandomVideo();
    if (!data) {
      setPhase({ type: 'loading' });
      return;
    }
    const count = sequenceRef.current.videosAfterAd;
    setVideoPhase(data.url, count, true);
  }, [fetchRandomVideo, setVideoPhase]);

  const playPreviousVideo = useCallback(() => {
    // Need at least 2 entries to go back (current + previous)
    if (historyRef.current.length < 2) return false;
    // Remove current
    historyRef.current.pop();
    const prevSrc = historyRef.current[historyRef.current.length - 1];
    // Do not push again to history when showing prev
    suppressHistoryPushRef.current = true;
    const count = sequenceRef.current.videosAfterAd;
    setVideoPhase(prevSrc, count, false);
    suppressHistoryPushRef.current = false;
    return true;
  }, [setVideoPhase]);

  const showAd = useCallback(() => {
    setPhase({ type: 'ad' });
  }, []);

  const handleVideoEnd = useCallback(() => {
    // After single video → ad; after two videos → ad
    if (sequenceRef.current.videosAfterAd === 1) {
      // Next phase: ad, then set to two videos
      sequenceRef.current = { nextIsSingle: false, videosAfterAd: 2 };
      showAd();
    } else {
      // We are in two-video phase; decrement until 0 then ad
      const remaining = sequenceRef.current.videosAfterAd - 1;
      if (remaining <= 0) {
        sequenceRef.current = { nextIsSingle: false, videosAfterAd: 2 };
        showAd();
      } else {
        sequenceRef.current.videosAfterAd = remaining;
        // Continue to next video immediately
        playNextVideo();
      }
    }
  }, [playNextVideo, showAd]);

  const handleAdFinished = useCallback(() => {
    // After any ad, we should play the next block of 2 videos
    sequenceRef.current = { nextIsSingle: false, videosAfterAd: 2 };
    playNextVideo();
  }, [playNextVideo]);

  useEffect(() => {
    // Kick off: play 1 video then ad, then 2 videos cycles
    (async () => {
      sequenceRef.current = { nextIsSingle: true, videosAfterAd: 1 };
      await playNextVideo();
    })();
  }, [playNextVideo]);

  const noVideosMessage = useMemo(() => (phase.type === 'loading' ? 'Loading...' : ''), [phase]);

  return {
    phase,
    noVideosMessage,
    playNextVideo,
    playPreviousVideo,
    handleVideoEnd,
    handleAdFinished,
  } as const;
}

