import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('CLOUDINARY_URL exists:', !!process.env.CLOUDINARY_URL);
    
    if (!process.env.CLOUDINARY_URL) {
      return NextResponse.json({ 
        error: 'CLOUDINARY_URL environment variable not set',
        configured: false 
      });
    }

    // Configure Cloudinary
    cloudinary.config({
      secure: true,
    });

    // Test connection by trying to get account info
    try {
      const result = await cloudinary.api.ping();
      console.log('Cloudinary ping result:', result);
      
      return NextResponse.json({ 
        success: true,
        message: 'Cloudinary connection successful',
        ping: result,
        configured: true
      });
    } catch (error) {
      console.error('Cloudinary ping error:', error);
      return NextResponse.json({ 
        error: 'Cloudinary connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        configured: true
      });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
