import { v2 as cloudinary } from 'cloudinary';

// Cloudinary SDK will auto-configure from CLOUDINARY_URL env
cloudinary.config({
  secure: true,
});

export type CloudinaryVideo = {
  public_id: string;
  playback_url: string;
  url: string;
};

export async function getRandomVideo(): Promise<CloudinaryVideo | null> {
  const res = await cloudinary.search
    .expression('resource_type:(video OR image)')
    .max_results(100)
    .execute();

  const resources: any[] = res.resources || [];
  if (!resources.length) return null;

  // Use timestamp-based randomization for better variety
  const timestamp = Date.now();
  const randomSeed = timestamp % resources.length;
  
  // Also shuffle the array for additional randomization
  const shuffled = [...resources].sort(() => Math.random() - 0.5);
  const chosen = shuffled[randomSeed] || shuffled[0];

  const playback_url = cloudinary.url(chosen.public_id, {
    resource_type: chosen.resource_type,
    type: 'upload',
    secure: true,
  });

  console.log(`Selected video: ${chosen.public_id} (from ${resources.length} total resources)`);

  return {
    public_id: chosen.public_id,
    playback_url,
    url: playback_url,
  };
}

export async function uploadVideo(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'video-streaming',
          public_id: `video_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: (result as any).secure_url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'image-gallery',
          public_id: `image_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: (result as any).secure_url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function uploadMedia(
  file: File, 
  caption: string, 
  description: string
): Promise<{ success: boolean; url?: string; error?: string; mediaType?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const folder = isVideo ? 'video-streaming' : 'image-gallery';
    const publicId = `${resourceType}_${Date.now()}`;
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: folder,
          public_id: publicId,
          context: {
            caption: caption,
            description: description,
            alt: caption, // Use caption as alt text for images
          },
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: (result as any).secure_url,
      mediaType: resourceType,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

