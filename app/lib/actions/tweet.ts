'use server';

import { error } from 'console';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';

export async function createTweet(formData: FormData) {
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
