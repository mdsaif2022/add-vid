"use client";
import React, { useState } from 'react';
import AdModal from '@/components/AdModal';

export default function TestAdPage() {
  const [showAd, setShowAd] = useState(false);
  const [adCount, setAdCount] = useState(0);

  const handleAdFinished = () => {
    console.log('Ad finished!');
    setShowAd(false);
    setAdCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Adsterra Test Page</h1>
        <p className="mb-6">Test the Adsterra popup ads integration</p>
        
        <button
          onClick={() => setShowAd(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Show Adsterra Ad
        </button>
        
        <div className="mt-4 text-sm text-gray-600">
          Ads shown: {adCount}
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Check browser console for debug logs</p>
          <p>If ads don't show, try disabling ad blocker</p>
        </div>
      </div>

      {showAd && (
        <AdModal 
          onFinished={handleAdFinished}
          minViewMs={3000}
          maxWaitMs={15000}
        />
      )}
    </div>
  );
}
