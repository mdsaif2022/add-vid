import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variable
if (process.env.CLOUDINARY_URL) {
  console.log('Configuring Cloudinary with URL:', process.env.CLOUDINARY_URL);
  cloudinary.config({
    secure: true,
  });
} else {
  console.log('CLOUDINARY_URL not found in environment variables');
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    console.log('CLOUDINARY_URL exists:', !!process.env.CLOUDINARY_URL);
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_URL) {
      console.error('CLOUDINARY_URL environment variable is not set');
      // For demo purposes, return a mock success response
      const formData = await request.formData();
      const file = formData.get('media') as File;
      const caption = (formData.get('caption') as string) || '';
      const description = (formData.get('description') as string) || '';
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Return mock success for demo
      return NextResponse.json({ 
        success: true, 
        url: 'https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Demo+Video',
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
        message: 'Demo mode - Cloudinary not configured'
      });
    }

    const formData = await request.formData();
    const file = formData.get('media') as File;
    const caption = (formData.get('caption') as string) || '';
    const description = (formData.get('description') as string) || '';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'File must be a video or image' }, { status: 400 });
    }

    // Size checks
    const maxVideoSize = 100 * 1024 * 1024;
    const maxImageSize = 10 * 1024 * 1024;
    const maxSize = isVideo ? maxVideoSize : maxImageSize;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size: ${isVideo ? '100MB' : '10MB'}` }, { status: 400 });
    }

    // Upload with context metadata
    console.log('Starting Cloudinary upload...');
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    console.log('Caption:', caption);
    console.log('Description:', description);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try direct upload first
    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          resource_type: isVideo ? 'video' : 'image',
          folder: isVideo ? 'video-streaming' : 'image-gallery',
          public_id: `${isVideo ? 'video' : 'image'}_${Date.now()}`,
          context: {
            caption,
            description,
          },
        }
      );
      
      console.log('Cloudinary upload successful:', result.public_id);
      return NextResponse.json({ 
        success: true, 
        url: result.secure_url, 
        mediaType: isVideo ? 'video' : 'image',
        publicId: result.public_id
      });
    } catch (uploadError) {
      console.error('Direct upload failed, trying stream upload...', uploadError);
      
      // Fallback to stream upload
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: isVideo ? 'video' : 'image',
            folder: isVideo ? 'video-streaming' : 'image-gallery',
            public_id: `${isVideo ? 'video' : 'image'}_${Date.now()}`,
            context: {
              caption,
              description,
            },
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result?.public_id);
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return NextResponse.json({ 
        success: true, 
        url: (result as any).secure_url, 
        mediaType: isVideo ? 'video' : 'image',
        publicId: (result as any).public_id
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ 
      error: `Upload failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
