'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';

export async function createTweet(formData: FormData) {
  
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  formData.append('authorId', session?.user?.id);

  const content = formData.get('content') as string;
  const authorId = formData.get('authorId') as string;

  if (!authorId || !content) {
    throw new Error('content and id required');
  }

  try {
    const latestTweet = await prisma.tweet.findFirst({
      orderBy: { tweetId: 'desc' },
    });

    const newTweetId = latestTweet ? (parseInt(latestTweet.tweetId, 10) + 1).toString() : '1';

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
        author: true,
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
