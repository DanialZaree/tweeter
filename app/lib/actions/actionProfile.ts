'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';
import { revalidatePath } from 'next/cache';
import z from 'zod';

const optionalUrlSchema = z
  .string()
  .max(1000, 'URL must be 1000 characters or less')
  .url('Must be a valid URL')
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'URL must start with http:// or https://',
  })
  .optional()
  .nullable();

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must be 30 characters or less')
    .refine((val) => !/[<>]/.test(val), { message: 'Name cannot contain < or > characters' }),
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .toLowerCase(),
  bio: z
    .string()
    .trim()
    .max(200, 'Bio must be 200 characters or less')
    .refine((val) => !val || !/[<>]/.test(val), { message: 'Bio cannot contain < or > characters' })
    .optional()
    .nullable(),
  job: z
    .string()
    .trim()
    .max(15, 'Job must be 15 characters or less')
    .refine((val) => !val || !/[<>]/.test(val), { message: 'Job cannot contain < or > characters' })
    .optional()
    .nullable(),
  avatar: optionalUrlSchema,
  coverImage: optionalUrlSchema,
});

const safeUserSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  coverImage: true,
  bio: true,
  job: true,
  createdAt: true,
};

export async function showProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      ...safeUserSelect,
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

import { checkRateLimit } from '@/app/lib/ratelimit';

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

  const rateCheck = await checkRateLimit(`updateProfile:${userId}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  const name = data.name.trim();
  const userName = data.userName.trim().toLowerCase();
  const bio = data.bio?.trim() || null;
  const job = data.job?.trim() || null;
  const avatar = data.avatar?.trim() || null;
  const coverImage = data.coverImage?.trim() || null;

  const validation = schema.safeParse({ name, userName, bio, job, avatar, coverImage });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message };
  }

  const RESERVED_USERNAMES = new Set([
    'profile',
    'admin',
    'administrator',
    'api',
    'auth',
    'login',
    'signup',
    'signin',
    'register',
    'settings',
    'user',
    'users',
    'home',
    'explore',
    'notifications',
    'messages',
    'bookmarks',
    'help',
    'support',
    'terms',
    'privacy',
    'about',
    'dashboard',
    'status',
    'system',
  ]);
  if (RESERVED_USERNAMES.has(validation.data.userName)) {
    return { success: false, error: 'This username is reserved' };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      userName: validation.data.userName,
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
        name: validation.data.name,
        userName: validation.data.userName,
        bio: validation.data.bio,
        job: validation.data.job,
        avatar: validation.data.avatar ?? null,
        coverImage: validation.data.coverImage ?? null,
      },
      select: safeUserSelect,
    });

    revalidatePath('/profile');
    revalidatePath(`/${userName}`);

    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
