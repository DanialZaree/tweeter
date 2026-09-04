'use server';

import { z } from 'zod';
import prisma from '../prisma';
import { auth } from '@/app/auth';
import { checkRateLimit } from '@/app/lib/ratelimit';

const searchQuerySchema = z
  .string()
  .trim()
  .min(1, 'Search query cannot be empty')
  .max(30, 'Search query cannot exceed 30 characters')
  .transform((val) => val.replace(/[^\p{L}\p{N}\s._-]/gu, ''));

export interface SearchUserItem {
  id: string;
  name: string | null;
  userName: string | null;
  avatar: string | null;
  bio?: string | null;
}

export interface SearchUsersResult {
  success: boolean;
  error?: string;
  users: SearchUserItem[];
}

export async function searchUsers(query: string): Promise<SearchUsersResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        error: 'You must be signed in to search users.',
        users: [],
      };
    }

    const rateCheck = await checkRateLimit(`search:${userId}`, 30, 60);
    if (!rateCheck.success) {
      return {
        success: false,
        error: rateCheck.error || 'Too many searches. Please wait a moment.',
        users: [],
      };
    }

    const validation = searchQuerySchema.safeParse(query);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid search query',
        users: [],
      };
    }

    const sanitized = validation.data;
    if (!sanitized) {
      return { success: true, users: [] };
    }

    const response = await prisma.$runCommandRaw({
      aggregate: 'User',
      pipeline: [
        {
          $search: {
            index: 'user_autocomplete',
            compound: {
              should: [
                {
                  autocomplete: {
                    query: sanitized,
                    path: 'userName',
                    fuzzy: { maxEdits: 1 },
                  },
                },
                {
                  autocomplete: {
                    query: sanitized,
                    path: 'name',
                    fuzzy: { maxEdits: 1 },
                  },
                },
              ],
            },
          },
        },
        {
          $limit: 8,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            userName: 1,
            avatar: 1,
            image: 1,
            bio: 1,
          },
        },
      ],
      cursor: {},
    });

    const batch = (response as any)?.cursor?.firstBatch || [];

    const users: SearchUserItem[] = batch.map((user: any) => ({
      id: user._id?.$oid || user._id?.toString() || '',
      name: user.name ?? null,
      userName: user.userName ?? null,
      avatar: user.avatar ?? user.image ?? null,
      bio: user.bio ?? null,
    }));

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
      users: [],
    };
  }
}
