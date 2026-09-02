'use server';

import { auth } from '@/app/auth';
import prisma from '../prisma';

export async function savePushSub(subJSON: any) {
  try {
    const session = await auth();
    if (!session?.user.id) {
      return { success: 'false', error: 'Unauthorized' };
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subJSON.endpoint },
      update: {
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth,
        userId: session.user.id,
      },
      create: {
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('error is saving push sub: ', error);
    return { success: 'false', error: 'error save push sub' };
  }
}
