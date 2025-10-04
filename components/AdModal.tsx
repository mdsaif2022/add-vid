"use client";
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onFinished: () => void;
  minViewMs?: number;
  maxWaitMs?: number;
};

export default function AdModal({ onFinished, minViewMs = 2000, maxWaitMs = 10000 }: Props) {
  const [phase, setPhase] = useState<'loading' | 'showing' | 'done'>('loading');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ranRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (ranRef.current) return; // prevent double-run in React StrictMode
    ranRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    let finished = false;
    const finish = () => {
      if (finished || !mountedRef.current) return;
      finished = true;
      setPhase('done');
      onFinished();
    };

    const startTs = Date.now();

    // 1) Try inline script injection (preferred by networks)
    const inlineScript = document.createElement('script');
    inlineScript.type = 'text/javascript';
    inlineScript.src = 'https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js';
    inlineScript.async = true;

    const handleLoaded = () => {
      setPhase('showing');
      const elapsed = Date.now() - startTs;
      const wait = Math.max(0, minViewMs - elapsed);
      setTimeout(() => finish(), wait);
    };

    const handleError = () => {
      // 2) Fallback: load inside isolated iframe (some blockers allow this)
      tryIframe();
    };

    inlineScript.addEventListener('load', handleLoaded);
    inlineScript.addEventListener('error', handleError);

    if (container) {
      container.innerHTML = '';
      container.appendChild(inlineScript);
    }

    // Hard timeout if nothing worked
    const hardTimeout = setTimeout(() => finish(), maxWaitMs);

    // 2) Fallback to iframe after a short grace if not loaded yet
    const iframeFallbackTimer = setTimeout(() => {
      if (!finished) {
        tryIframe();
      }
    }, 1500);

    function tryIframe() {
      const host = containerRef.current;
      if (finished || !host) return;
      setPhase('loading');
      host.innerHTML = '';
      const frame = document.createElement('iframe');
      frame.title = 'ad';
      frame.style.border = '0';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      host.appendChild(frame);
      try {
        const doc = frame.contentDocument || frame.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(`<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/></head><body style=\"margin:0;padding:0;overflow:hidden;background:#000;\">\n          <script type=\"text/javascript\" src=\"https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js\"><\\/script>\n        </body></html>`);
        doc.close();
        setPhase('showing');
        const elapsed = Date.now() - startTs;
        const wait = Math.max(0, minViewMs - elapsed);
        setTimeout(() => finish(), wait);
      } catch {
        // If frame write fails repeatedly, keep waiting for hard timeout
      }
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(hardTimeout);
      clearTimeout(iframeFallbackTimer);
    };
  }, [onFinished, minViewMs, maxWaitMs]);

  // Reset the component when it mounts
  useEffect(() => {
    mountedRef.current = true;
    ranRef.current = false;
    setPhase('loading');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Spinner while waiting */}
      {phase !== 'showing' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}
      <div ref={containerRef} className="h-screen w-screen" />
    </div>
  );
}

