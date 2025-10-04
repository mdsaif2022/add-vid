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
  const playedVideosRef = useRef<Set<string>>(new Set());

  const fetchRandomVideo = useCallback(async (): Promise<Video | null> => {
    try {
      console.log('Fetching random video...');
      const res = await fetch('/api/videos', { cache: 'no-store' });
      if (!res.ok) {
        console.error('Video fetch failed:', res.status, res.statusText);
        return null;
      }
      const video = await res.json();
      console.log('Video fetched successfully:', video.url);
      
      // Check if we've already played this video recently
      if (playedVideosRef.current.has(video.url)) {
        console.log('Video already played recently, fetching another...');
        // Try to fetch a different video by adding a cache-busting parameter
        const res2 = await fetch(`/api/videos?t=${Date.now()}`, { cache: 'no-store' });
        if (res2.ok) {
          const video2 = await res2.json();
          console.log('Alternative video fetched:', video2.url);
          return video2;
        }
      }
      
      // Mark this video as played
      playedVideosRef.current.add(video.url);
      
      // If we've played too many videos, reset the set to allow repetition
      if (playedVideosRef.current.size > 10) {
        playedVideosRef.current.clear();
        console.log('Cleared played videos set to allow repetition');
      }
      
      return video;
    } catch (error) {
      console.error('Video fetch error:', error);
      return null;
    }
  }, []);

  const setVideoPhase = useCallback((src: string, count: number, pushToHistory: boolean) => {
    if (pushToHistory) historyRef.current.push(src);
    setPhase({ type: 'video', countInSequence: count, src });
  }, []);

  const playNextVideo = useCallback(async () => {
    console.log('playNextVideo called');
    const data = await fetchRandomVideo();
    if (!data) {
      console.log('No video data, setting loading phase');
      setPhase({ type: 'loading' });
      return;
    }
    const count = sequenceRef.current.videosAfterAd;
    console.log('Setting video phase with count:', count);
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
    console.log('Video ended, current sequence:', sequenceRef.current);
    // After single video → ad; after two videos → ad
    if (sequenceRef.current.videosAfterAd === 1) {
      // Next phase: ad, then set to two videos
      console.log('Single video finished, showing ad');
      sequenceRef.current = { nextIsSingle: false, videosAfterAd: 2 };
      showAd();
    } else {
      // We are in two-video phase; decrement until 0 then ad
      const remaining = sequenceRef.current.videosAfterAd - 1;
      console.log('Videos remaining in sequence:', remaining);
      if (remaining <= 0) {
        console.log('Two videos finished, showing ad');
        sequenceRef.current = { nextIsSingle: false, videosAfterAd: 2 };
        showAd();
      } else {
        sequenceRef.current.videosAfterAd = remaining;
        console.log('Playing next video in sequence');
        // Continue to next video immediately
        playNextVideo();
      }
    }
  }, [playNextVideo, showAd]);

  const handleAdFinished = useCallback(() => {
    console.log('Ad finished, starting next video block');
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

