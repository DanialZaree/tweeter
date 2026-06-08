'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';

export async function showProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  return user;
}
