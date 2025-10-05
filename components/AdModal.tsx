"use client";
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onFinished: () => void;
  minViewMs?: number;
  maxWaitMs?: number;
};

export default function AdModal({ onFinished, minViewMs = 3000, maxWaitMs = 15000 }: Props) {
  const [phase, setPhase] = useState<'loading' | 'showing' | 'done'>('loading');
  const [adMethod, setAdMethod] = useState<'script' | 'iframe' | 'fallback'>('script');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ranRef = useRef(false);
  const mountedRef = useRef(true);
  const adLoadedRef = useRef(false);

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
      setTimeout(() => onFinished(), 100); // Small delay to ensure state updates
    };

    const startTs = Date.now();

    // Method 1: Try direct script injection
    const tryScriptMethod = () => {
      console.log('Adsterra: Trying script method...');
      setAdMethod('script');
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js';
      script.async = true;
      script.defer = true;

      const handleLoaded = () => {
        console.log('Adsterra: Script loaded successfully');
        adLoadedRef.current = true;
        setPhase('showing');
        const elapsed = Date.now() - startTs;
        const wait = Math.max(0, minViewMs - elapsed);
        setTimeout(() => finish(), wait);
      };

      const handleError = () => {
        console.log('Adsterra: Script failed, trying iframe method...');
        setTimeout(() => tryIframeMethod(), 500);
      };

      script.addEventListener('load', handleLoaded);
      script.addEventListener('error', handleError);
      
      container.innerHTML = '';
      container.appendChild(script);

      // Timeout for script method
      setTimeout(() => {
        if (!adLoadedRef.current && !finished) {
          console.log('Adsterra: Script timeout, trying iframe...');
          tryIframeMethod();
        }
      }, 3000);
    };

    // Method 2: Try iframe method
    const tryIframeMethod = () => {
      console.log('Adsterra: Trying iframe method...');
      setAdMethod('iframe');
      
      const iframe = document.createElement('iframe');
      iframe.title = 'Adsterra Ad';
      iframe.style.border = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.background = '#000';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
      
      container.innerHTML = '';
      container.appendChild(iframe);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          console.log('Adsterra: Cannot access iframe document');
          setTimeout(() => tryFallbackMethod(), 1000);
          return;
        }

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Adsterra Ad</title>
              <style>
                body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                .ad-container { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
              </style>
            </head>
            <body>
              <div class="ad-container">
                <script type="text/javascript" src="https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js"></script>
              </div>
            </body>
          </html>
        `);
        doc.close();

        console.log('Adsterra: Iframe content loaded');
        adLoadedRef.current = true;
        setPhase('showing');
        const elapsed = Date.now() - startTs;
        const wait = Math.max(0, minViewMs - elapsed);
        setTimeout(() => finish(), wait);

      } catch (error) {
        console.log('Adsterra: Iframe method failed:', error);
        setTimeout(() => tryFallbackMethod(), 1000);
      }
    };

    // Method 3: Fallback method (show message)
    const tryFallbackMethod = () => {
      console.log('Adsterra: Using fallback method...');
      setAdMethod('fallback');
      
      container.innerHTML = `
        <div style="
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div style="font-size: 24px; margin-bottom: 20px;">🎯</div>
          <h2 style="margin: 0 0 10px 0; font-size: 28px;">Ad Blocked</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">
            Please disable your ad blocker to support our content
          </p>
          <div style="font-size: 14px; opacity: 0.7;">
            This ad helps us keep the service free
          </div>
        </div>
      `;
      
      setPhase('showing');
      const elapsed = Date.now() - startTs;
      const wait = Math.max(0, minViewMs - elapsed);
      setTimeout(() => finish(), wait);
    };

    // Start with script method
    tryScriptMethod();

    // Hard timeout
    const hardTimeout = setTimeout(() => {
      if (!finished) {
        console.log('Adsterra: Hard timeout reached');
        finish();
      }
    }, maxWaitMs);

    return () => {
      mountedRef.current = false;
      clearTimeout(hardTimeout);
    };
  }, [onFinished, minViewMs, maxWaitMs]);

  // Reset the component when it mounts
  useEffect(() => {
    mountedRef.current = true;
    ranRef.current = false;
    adLoadedRef.current = false;
    setPhase('loading');
    setAdMethod('script');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Loading spinner */}
      {phase === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto mb-4" />
            <p className="text-white/80 text-sm">
              Loading ad... ({adMethod})
            </p>
          </div>
        </div>
      )}
      
      {/* Ad container */}
      <div ref={containerRef} className="h-screen w-screen" />
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded">
          Method: {adMethod} | Phase: {phase}
        </div>
      )}
    </div>
  );
}

