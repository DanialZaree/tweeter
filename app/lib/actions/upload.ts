'use server';

import { auth } from '@/app/auth';
import { checkRateLimit } from '@/app/lib/ratelimit';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary on the server (supporting CLOUDINARY_URL and individual env vars)
function initCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    try {
      const parsed = new URL(cloudinaryUrl);
      cloudinary.config({
        cloud_name:
          parsed.hostname ||
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
          process.env.CLOUDINARY_CLOUD_NAME,
        api_key: parsed.username || process.env.CLOUDINARY_API_KEY,
        api_secret: parsed.password || process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      return;
    } catch {
      // fallback
    }
  }

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

initCloudinary();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }

  // GIF: 47 49 46 38 ("GIF8")
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WEBP: "RIFF" at offset 0, "WEBP" at offset 8
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return true;
  }

  return false;
}

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadImage(
  formData: FormData,
  folderType: 'tweets' | 'avatars' | 'covers' = 'tweets',
): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }

  const userId = session.user.id;

  // 1. Burst Rate Limit: Max 3 uploads per minute per user
  const burstCheck = await checkRateLimit(`upload_burst:${userId}`, 3, 60);
  if (!burstCheck.success) {
    return {
      success: false,
      error: 'Please wait a moment before uploading another image.',
    };
  }

  // 2. Strict Daily Rate Limit: Max 15 uploads per user every 24 hours (86,400 seconds)
  const dailyCheck = await checkRateLimit(`upload_daily:${userId}`, 15, 86400);
  if (!dailyCheck.success) {
    return {
      success: false,
      error: 'Daily upload limit reached (15 images per day). Please try again tomorrow.',
    };
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Image size must be less than 8MB' };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.',
    };
  }

  try {
    initCloudinary();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isValidImageMagicBytes(buffer)) {
      return { success: false, error: 'Corrupt or invalid image file format' };
    }

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tweeter/${folderType}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
          } else {
            resolve(result as { secure_url: string });
          }
        },
      );
      uploadStream.end(buffer);
    });

    return {
      success: true,
      url: uploadResult.secure_url,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}
