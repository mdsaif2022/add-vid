import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ secure: true });

function demoItems() {
  return [
    {
      public_id: 'demo_video_dog',
      type: 'video',
      url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      caption: 'Dog video (demo)',
      description: 'Demo video from Cloudinary demo account',
      created_at: new Date().toISOString(),
    },
    {
      public_id: 'demo_image_sample',
      type: 'image',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      caption: 'Sample image (demo)',
      description: 'Demo image from Cloudinary demo account',
      created_at: new Date().toISOString(),
    },
    {
      public_id: 'demo_video_bike',
      type: 'video',
      url: 'https://res.cloudinary.com/demo/video/upload/bike.mp4',
      caption: 'Bike video (demo)',
      description: 'Another demo video',
      created_at: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  try {
    const res = await cloudinary.search
      .expression('resource_type:(image OR video)')
      .with_field('context')
      .sort_by('created_at', 'desc')
      .max_results(20)
      .execute();

    const items = (res.resources || []).map((r: any) => ({
      public_id: r.public_id,
      type: r.resource_type,
      url: r.secure_url,
      caption: r.context?.custom?.caption || '',
      description: r.context?.custom?.description || '',
      created_at: r.created_at,
    }));

    if (!items.length) {
      return NextResponse.json({ items: demoItems(), demo: true });
    }

    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: demoItems(), demo: true });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { public_id } = await req.json();
    if (!public_id) {
      return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
    }

    // Try deleting as image first, then video if needed
    let result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    if (result.result === 'not found') {
      result = await cloudinary.uploader.destroy(public_id, { resource_type: 'video' });
    }

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
