'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';
import { success, z } from 'zod';
import { checkRateLimit } from '@/app/lib/ratelimit';

const tweetInputSchema = z.object({
  content: z
    .string()
    .min(1, 'content is required')
    .max(500, 'content must be less than 500 characters'),
});
const safeAuthorSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  job: true,
  createdAt: true,
};
export async function createTweet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new Error('User not found');
  }
  const authorId = user.id;
  const rawContent = formData.get('content') as string;

  const validation = tweetInputSchema.safeParse({ content: rawContent });

  if (!validation.success) {
    return { success: false, error: validation.error?.message };
  }
  const content = validation.data.content;

  const rateCheck = await checkRateLimit(`tweet:${authorId}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  try {
    const latestTweet = await prisma.tweet.findFirst({
      where: { tweetId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    const newTweetId =
      latestTweet?.tweetId && !isNaN(parseInt(latestTweet.tweetId, 10))
        ? (parseInt(latestTweet.tweetId, 10) + 1).toString()
        : '1';

    const tweet = await prisma.tweet.create({
      data: {
        authorId: authorId,
        tweetId: newTweetId,
        content: content,
        parentId: null,
        createdAt: new Date(),
      },
    });

    revalidatePath('/');
    return { success: true, tweet };
  } catch (error) {
    console.error('Error in createTweet:', error);
    return { success: false, error: 'Failed to post tweet' };
  }
}

export async function allTweets() {
  try {
    const tweets = await prisma.tweet.findMany({
      where: {
        OR: [
          { parentId: null },
          { parentId: { isSet: false } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: safeAuthorSelect },
        likes: true,
        _count: { select: { replies: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            _count: { select: { replies: true } },
          },
        },
      },
    });
    return { success: true, tweets };
  } catch (e) {
    console.error('Error in allTweets:', e);
    return { success: false, error: 'Failed to fetch tweets' };
  }
}

export async function getTweetById(tweetId: string) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(tweetId);
    const tweet = await prisma.tweet.findFirst({
      where: {
        OR: [
          { tweetId: tweetId },
          ...(isObjectId ? [{ id: tweetId }] : [])
        ]
      },
      include: {
        author: { select: safeAuthorSelect },
        likes: true,
        _count: { select: { replies: true } },
        replies: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            _count: { select: { replies: true } },
          },
        },
      },
    });
    return { success: true, tweet };
  } catch (e) {
    console.error('Error in getTweetById:', e);
    return { success: false, error: 'Failed to fetch tweet' };
  }
}
export async function getTweetByUserId(userId: string) {
  try {
    const tweets = await prisma.tweet.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: safeAuthorSelect,
        },
        likes: true,
        _count: { select: { replies: true } },
      },
    });
    return { success: true, tweets };
  } catch (e) {
    console.error('Error in getTweetByUserId:', e);
    return { success: false, error: 'Failed to fetch tweets' };
  }
}

export async function deleteTweet(tweetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { authorId: true },
    });

    if (!tweet) {
      return { success: false, error: 'Tweet not found' };
    }

    if (tweet.authorId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.tweet.delete({
      where: { id: tweetId },
    });

    revalidatePath('/');
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error('Error in deleteTweet:', e);
    return { success: false, error: 'Failed to delete tweet' };
  }
}

export async function editTweet(tweetId: string, newContent: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }
  const validation = tweetInputSchema.safeParse({ content: newContent });
  if (!validation.success) {
    return { success: false, error: validation.error?.message };
  }
  const content = validation.data.content;

  const rateCheck = await checkRateLimit(`edit:${session.user.id}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  try {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { authorId: true },
    });

    if (!tweet) {
      return { success: false, error: 'Tweet not found' };
    }

    if (tweet.authorId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.tweet.update({
      where: { id: tweetId },
      data: { content: content, isEdited: true },
    });

    revalidatePath('/');
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error('Error in editTweet:', e);
    return { success: false, error: 'Failed to edit tweet' };
  }
}
export async function createReply(parentId: string, content: string) {
  const session = await auth();
  if (!session?.user.id) return { success: false, error: 'User not authenticated' };

  const validation = tweetInputSchema.safeParse({ content: content });
  if (!validation.success) return { success: false, error: validation.error?.message };

  const rateCheck = await checkRateLimit(`reply:${session.user.id}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  try {
    const latestTweet = await prisma.tweet.findFirst({
      where: { tweetId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    const newTweetId =
      latestTweet?.tweetId && !isNaN(parseInt(latestTweet.tweetId, 10))
        ? (parseInt(latestTweet.tweetId, 10) + 1).toString()
        : '1';

    const reply = await prisma.tweet.create({
      data: {
        authorId: session.user.id,
        tweetId: newTweetId,
        content: validation.data.content,
        parentId: parentId,
        createdAt: new Date(),
      },
    });

    revalidatePath('/tweet/[tweet]', 'page');
    revalidatePath('/');
    return { success: true, reply };
  } catch (e) {
    console.error('Error in createReply:', e);
    return { success: false, error: 'Failed to create reply' };
  }
}
