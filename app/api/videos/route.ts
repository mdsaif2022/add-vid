import { NextResponse } from 'next/server';
import { getRandomVideo } from '@/lib/cloudinary';

export async function GET() {
  try {
    const video = await getRandomVideo();
    if (!video) {
      return NextResponse.json({ message: 'No videos available' }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch videos' }, { status: 500 });
  }
}

