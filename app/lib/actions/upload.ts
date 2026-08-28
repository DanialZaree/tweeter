'use server';

import { auth } from '@/app/auth';
import { checkRateLimit } from '@/app/lib/ratelimit';
import { v2 as cloudinary } from 'cloudinary';

export async function getCloudinarySignature() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }

  const rateCheck = await checkRateLimit(`upload:${session.user.id}`, 15, 900);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      cloudinary.config().api_secret as string,
    );

    return {
      success: true,
      timestamp,
      signature,
      apiKey: cloudinary.config().api_key,
    };
  } catch (error) {
    console.error('Error generating signature:', error);
    return { success: false, error: 'Failed to generate upload signature' };
  }
}
