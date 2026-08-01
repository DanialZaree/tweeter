'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';
import { revalidatePath } from 'next/cache';

export async function showProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      _count: {
        select: {
          tweets: true,
          followers: true,
          following: true,
        },
      },
    },
  });
  return user;
}

export async function updateProfile(data: {
  name: string;
  userName: string;
  bio?: string;
  job?: string;
  avatar?: string;
  coverImage?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }

  const userId = session.user.id;

  const name = data.name.trim();
  const userName = data.userName.trim().toLowerCase();
  const bio = data.bio?.trim() || null;
  const job = data.job?.trim() || null;
  const avatar = data.avatar?.trim() || null;
  const coverImage = data.coverImage?.trim() || null;

  if (!name) {
    return { success: false, error: 'Name is required' };
  }

  const USERNAME_REGEX = /^[a-z0-9]{3,20}$/;
  if (!userName || !USERNAME_REGEX.test(userName)) {
    return { success: false, error: 'Username can only contain letters and numbers (3 to 20 characters)' };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      userName: userName,
      NOT: {
        id: userId,
      },
    },
  });

  if (existingUser) {
    return { success: false, error: 'Username already taken' };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        userName,
        bio,
        job,
        avatar,
        coverImage,
      },
    });

    revalidatePath('/profile');
    revalidatePath(`/${userName}`);

    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

