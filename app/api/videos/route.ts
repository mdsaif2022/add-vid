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
    return NextResponse.json(video);
  } catch (error) {
    console.error('API: Error fetching video:', error);
    return NextResponse.json({ message: 'Failed to fetch videos' }, { status: 500 });
  }
}

