export const metadata = {
  title: 'Video Flow',
  description: 'Random Cloudinary video player with Adsterra breaks',
};

import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}

