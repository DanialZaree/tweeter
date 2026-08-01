'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';
import {z} from 'zod'

const tweetInputSchema = z.object({
  content:z.string().min(1,'content is required').max(500,'content must be less than 500 characters')
})

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

  const validation = tweetInputSchema.safeParse({content:rawContent});

  if (!validation.success) {
    return { success: false, error: validation.error?.message };
  }
  const content = validation.data.content;

  try {
    const latestTweet = await prisma.tweet.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const newTweetId = (latestTweet?.tweetId && !isNaN(parseInt(latestTweet.tweetId, 10)))
      ? (parseInt(latestTweet.tweetId, 10) + 1).toString()
      : '1';

    const tweet = await prisma.tweet.create({
      data: {
        authorId: authorId,
        tweetId: newTweetId,
        content: content,
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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            job: true,
            createdAt: true,
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
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
    const tweet = await prisma.tweet.findUnique({
      where: {
        tweetId: tweetId,
      },
      include: {
        author: true,
        likes: true,
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
        author: true,
        likes: true,
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
  const validation = tweetInputSchema.safeParse({content:newContent})
  if (!validation.success) {
    return { success: false, error: validation.error?.message };
  }
  const content = validation.data.content;

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
