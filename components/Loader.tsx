import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
    </div>
  );
}

