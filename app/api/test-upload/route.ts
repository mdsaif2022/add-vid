import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Test basic functionality
    const formData = await request.formData();
    const file = formData.get('media') as File;
    const caption = formData.get('caption') as string;
    const description = formData.get('description') as string;
    
    console.log('Test upload - File received:', file?.name);
    console.log('Test upload - Caption:', caption);
    console.log('Test upload - Description:', description);
    console.log('Test upload - CLOUDINARY_URL exists:', !!process.env.CLOUDINARY_URL);
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test successful',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      caption,
      description,
      cloudinaryConfigured: !!process.env.CLOUDINARY_URL
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
