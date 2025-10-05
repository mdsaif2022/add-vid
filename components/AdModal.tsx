"use client";
import React, { useEffect, useRef, useState } from 'react';
import { AD_CONFIG, AD_SETTINGS } from '@/lib/adConfig';

type Props = {
  onFinished: () => void;
  minViewMs?: number;
  maxWaitMs?: number;
};

// Build ad networks array from configuration
const AD_NETWORKS = Object.entries(AD_CONFIG)
  .filter(([_, config]) => config.enabled)
  .sort(([_, a], [__, b]) => a.priority - b.priority)
  .map(([name, config]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    script: config.script,
    method: name.includes('iframe') ? 'iframe' : 'script'
  }));

export default function AdModal({ 
  onFinished, 
  minViewMs = AD_SETTINGS.minViewTime, 
  maxWaitMs = AD_SETTINGS.maxWaitTime 
}: Props) {
  const [phase, setPhase] = useState<'loading' | 'showing' | 'done'>('loading');
  const [currentAd, setCurrentAd] = useState<string>('');
  const [adMethod, setAdMethod] = useState<string>('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ranRef = useRef(false);
  const mountedRef = useRef(true);
  const adLoadedRef = useRef(false);
  const currentAdIndex = useRef(0);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    let finished = false;
    const finish = () => {
      if (finished || !mountedRef.current) return;
      finished = true;
      setPhase('done');
      setTimeout(() => onFinished(), 100);
    };

    const startTs = Date.now();

    const tryAdNetwork = (adIndex: number) => {
      if (finished || adIndex >= AD_NETWORKS.length) {
        console.log('Adsterra: All ad networks failed, showing fallback');
        showFallbackAd();
        return;
      }

      const ad = AD_NETWORKS[adIndex];
      currentAdIndex.current = adIndex;
      setCurrentAd(ad.name);
      setAdMethod(ad.method);
      
      console.log(`Adsterra: Trying ${ad.name} (${ad.method})`);

      if (ad.method === 'script') {
        tryScriptMethod(ad);
      } else if (ad.method === 'iframe') {
        tryIframeMethod(ad);
      }
    };

    const tryScriptMethod = (ad: typeof AD_NETWORKS[0]) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = ad.script;
      script.async = true;
      script.defer = true;

      const handleLoaded = () => {
        console.log(`Adsterra: ${ad.name} script loaded successfully`);
        adLoadedRef.current = true;
        setPhase('showing');
        const elapsed = Date.now() - startTs;
        const wait = Math.max(0, minViewMs - elapsed);
        setTimeout(() => finish(), wait);
      };

      const handleError = () => {
        console.log(`Adsterra: ${ad.name} script failed, trying next network...`);
        setTimeout(() => tryAdNetwork(currentAdIndex.current + 1), 1000);
      };

      script.addEventListener('load', handleLoaded);
      script.addEventListener('error', handleError);
      
      container.innerHTML = '';
      container.appendChild(script);

      // Timeout for this method
      setTimeout(() => {
        if (!adLoadedRef.current && !finished) {
          console.log(`Adsterra: ${ad.name} script timeout, trying next network...`);
          tryAdNetwork(currentAdIndex.current + 1);
        }
      }, AD_SETTINGS.timeoutPerMethod);
    };

    const tryIframeMethod = (ad: typeof AD_NETWORKS[0]) => {
      const iframe = document.createElement('iframe');
      iframe.title = `${ad.name} Ad`;
      iframe.style.border = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.background = '#000';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation';
      
      container.innerHTML = '';
      container.appendChild(iframe);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          console.log(`Adsterra: Cannot access iframe document for ${ad.name}`);
          setTimeout(() => tryAdNetwork(currentAdIndex.current + 1), 1000);
          return;
        }

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${ad.name} Ad</title>
              <style>
                body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                .ad-container { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
                .loading { color: white; font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <div class="ad-container">
                <div class="loading">Loading ${ad.name} ad...</div>
                <script type="text/javascript" src="${ad.script}"></script>
              </div>
            </body>
          </html>
        `);
        doc.close();

        console.log(`Adsterra: ${ad.name} iframe content loaded`);
        adLoadedRef.current = true;
        setPhase('showing');
        const elapsed = Date.now() - startTs;
        const wait = Math.max(0, minViewMs - elapsed);
        setTimeout(() => finish(), wait);

      } catch (error) {
        console.log(`Adsterra: ${ad.name} iframe method failed:`, error);
        setTimeout(() => tryAdNetwork(currentAdIndex.current + 1), 1000);
      }
    };

    const showFallbackAd = () => {
      console.log('Adsterra: Showing fallback ad');
      setCurrentAd('Fallback');
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
          <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
          <h2 style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">Advertisement</h2>
          <p style="margin: 0 0 20px 0; font-size: 18px; opacity: 0.9;">
            This space is reserved for advertisements
          </p>
          <div style="font-size: 14px; opacity: 0.7; margin-bottom: 30px;">
            Ads help us keep this service free for everyone
          </div>
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            backdrop-filter: blur(10px);
          ">
            Thank you for your support! 🙏
          </div>
        </div>
      `;
      
      setPhase('showing');
      const elapsed = Date.now() - startTs;
      const wait = Math.max(0, minViewMs - elapsed);
      setTimeout(() => finish(), wait);
    };

    // Start trying ad networks
    tryAdNetwork(0);

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
    currentAdIndex.current = 0;
    setPhase('loading');
    setCurrentAd('');
    setAdMethod('');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Loading spinner */}
      {phase === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto mb-4" />
            <p className="text-white/80 text-lg font-semibold mb-2">
              Loading Advertisement...
            </p>
            <p className="text-white/60 text-sm">
              {currentAd && `${currentAd} (${adMethod})`}
            </p>
          </div>
        </div>
      )}
      
      {/* Ad container */}
      <div ref={containerRef} className="h-screen w-screen" />
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs p-3 rounded-lg">
          <div><strong>Ad:</strong> {currentAd}</div>
          <div><strong>Method:</strong> {adMethod}</div>
          <div><strong>Phase:</strong> {phase}</div>
          <div><strong>Index:</strong> {currentAdIndex.current}</div>
        </div>
      )}
    </div>
  );
}

