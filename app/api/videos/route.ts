import { NextResponse } from 'next/server';
import { getRandomVideo } from '@/lib/cloudinary';

export async function GET(request: Request) {
  try {
    // Get query parameters to prevent caching
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get('t');
    
    console.log(`API: Fetching video with timestamp: ${timestamp}`);
    
    const video = await getRandomVideo();
    if (!video) {
      return NextResponse.json({ message: 'No videos available' }, { status: 404 });
    }
    
    console.log(`API: Returning video: ${video.public_id}`);
    
    // Add headers to prevent caching on Vercel
    const response = NextResponse.json(video);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('API: Error fetching video:', error);
    return NextResponse.json({ message: 'Failed to fetch videos' }, { status: 500 });
  }
}

