'use server';

import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';
import { z } from 'zod';
import { checkRateLimit } from '@/app/lib/ratelimit';

const tweetInputSchema = z.object({
  content: z
    .string()
    .min(1, 'content is required')
    .max(500, 'content must be less than 500 characters'),
  mediaUrl: z
    .string()
    .url('mediaUrl must be a valid URL')
    .refine((url) => url.startsWith('https://res.cloudinary.com/'), {
      message: 'mediaUrl must be a secure Cloudinary URL',
    })
    .optional()
    .nullable(),
});
const safeAuthorSelect = {
  id: true,
  name: true,
  userName: true,
  avatar: true,
  job: true,
  createdAt: true,
};
async function getNextTweetId(): Promise<string> {
  const tweets = await prisma.tweet.findMany({
    where: { tweetId: { not: null } },
    select: { tweetId: true },
  });

  let maxId = 0;
  for (const t of tweets) {
    if (t.tweetId && /^\d+$/.test(t.tweetId)) {
      const num = parseInt(t.tweetId, 10);
      if (num > maxId) {
        maxId = num;
      }
    }
  }

  return (maxId + 1).toString();
}

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
  const retweetOfId = formData.get('retweetOfId') as string | null;
  const mediaUrl = formData.get('mediaUrl') as string | null;

  const validation = tweetInputSchema.safeParse({ content: rawContent, mediaUrl });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid input' };
  }
  const content = validation.data.content;
  const validatedMediaUrl = validation.data.mediaUrl;

  const rateCheck = await checkRateLimit(`tweet:${authorId}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  const dailyRateCheck = await checkRateLimit(`tweet_daily:${authorId}`, 15, 86400);
  if (!dailyRateCheck.success) {
    return {
      success: false,
      error: 'Daily tweet limit reached (15 tweets per day). Please try again tomorrow.',
    };
  }

  try {
    const newTweetId = await getNextTweetId();

    const tweet = await prisma.tweet.create({
      data: {
        authorId: authorId,
        tweetId: newTweetId,
        content: content,
        retweetOfId: retweetOfId,
        mediaUrl: validatedMediaUrl,
        parentId: null,
        ancestorIds: [],
        createdAt: new Date(),
      },
    });

    if (retweetOfId) {
      const originalTweet = await prisma.tweet.findUnique({
        where: { id: retweetOfId },
        select: { authorId: true },
      });

      if (originalTweet && originalTweet.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            recipientId: originalTweet.authorId,
            senderId: authorId,
            type: 'RETWEET',
            tweetId: tweet.id,
          },
        });
      }
    }

    revalidatePath('/', 'layout');
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
        OR: [{ parentId: null }, { parentId: { isSet: false } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: safeAuthorSelect },
        likes: true,
        retweetOf: {
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            retweets: { select: { authorId: true } },
            _count: { select: { replies: true, retweets: true } },
          },
        },
        retweets: { select: { authorId: true } },
        _count: { select: { replies: true, retweets: true } },
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
        OR: [{ tweetId: tweetId }, ...(isObjectId ? [{ id: tweetId }] : [])],
      },
      include: {
        author: { select: safeAuthorSelect },
        likes: true,
        retweetOf: {
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            retweets: { select: { authorId: true } },
            _count: { select: { replies: true, retweets: true } },
          },
        },
        retweets: { select: { authorId: true } },
        _count: { select: { replies: true, retweets: true } },
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
        OR: [{ parentId: null }, { parentId: { isSet: false } }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: safeAuthorSelect,
        },
        likes: true,
        retweetOf: {
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            retweets: { select: { authorId: true } },
            _count: { select: { replies: true, retweets: true } },
          },
        },
        retweets: { select: { authorId: true } },
        _count: { select: { replies: true, retweets: true } },
      },
    });
    return { success: true, tweets };
  } catch (e) {
    console.error('Error in getTweetByUserId:', e);
    return { success: false, error: 'Failed to fetch tweets' };
  }
}

export async function getRepliesByUserId(userId: string) {
  try {
    const tweets = await prisma.tweet.findMany({
      where: {
        authorId: userId,
        parentId: { not: null },
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
    console.error('Error in getRepliesByUserId:', e);
    return { success: false, error: 'Failed to fetch replies' };
  }
}

export async function deleteTweet(tweetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userName: true },
    });

    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { authorId: true, ancestorIds: true, totalReplies: true },
    });

    if (!tweet) {
      return { success: false, error: 'Tweet not found' };
    }

    const isAdmin = user?.userName?.toLowerCase() === 'danial';

    if (tweet.authorId !== session.user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.tweet.updateMany({
      where: { retweetOfId: tweetId },
      data: {
        originalTweetDeleted: true,
        retweetOfId: null,
      },
    });

    if (tweet.ancestorIds && tweet.ancestorIds.length > 0) {
      await prisma.tweet.updateMany({
        where: { id: { in: tweet.ancestorIds } },
        data: { totalReplies: { decrement: 1 + (tweet.totalReplies || 0) } },
      });
    }

    await prisma.tweet.deleteMany({
      where: {
        OR: [{ ancestorIds: { has: tweetId } }, { parentId: tweetId }],
      },
    });

    await prisma.tweet.delete({
      where: { id: tweetId },
    });

    revalidatePath('/', 'layout');
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, userName: true },
    });

    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { authorId: true },
    });

    if (!tweet) {
      return { success: false, error: 'Tweet not found' };
    }

    const isAdmin = user?.userName?.toLowerCase() === 'danial';

    if (tweet.authorId !== session.user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.tweet.update({
      where: { id: tweetId },
      data: { content: content, isEdited: true },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e) {
    console.error('Error in editTweet:', e);
    return { success: false, error: 'Failed to edit tweet' };
  }
}
export async function createReply(parentId: string, content: string, mediaUrl?: string | null) {
  const session = await auth();
  if (!session?.user.id) return { success: false, error: 'User not authenticated' };

  const validation = tweetInputSchema.safeParse({ content: content, mediaUrl });
  if (!validation.success)
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid input' };

  const rateCheck = await checkRateLimit(`reply:${session.user.id}`, 5, 60);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.' };
  }

  const dailyRateCheck = await checkRateLimit(`reply_daily:${session.user.id}`, 30, 86400);
  if (!dailyRateCheck.success) {
    return {
      success: false,
      error: 'Daily reply limit reached (30 replies per day). Please try again tomorrow.',
    };
  }

  try {
    const newTweetId = await getNextTweetId();

    const parentTweet = await prisma.tweet.findUnique({
      where: { id: parentId },
      select: { ancestorIds: true, authorId: true },
    });
    const ancestorIds = parentTweet ? [...(parentTweet.ancestorIds || []), parentId] : [parentId];

    const reply = await prisma.tweet.create({
      data: {
        authorId: session.user.id,
        tweetId: newTweetId,
        content: validation.data.content,
        mediaUrl: validation.data.mediaUrl,
        parentId: parentId,
        ancestorIds: ancestorIds,
        createdAt: new Date(),
      },
    });

    if (ancestorIds.length > 0) {
      await prisma.tweet.updateMany({
        where: { id: { in: ancestorIds } },
        data: { totalReplies: { increment: 1 } },
      });
    }

    if (parentTweet && parentTweet.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: parentTweet.authorId,
          senderId: session.user.id,
          type: 'REPLY',
          tweetId: reply.id,
        },
      });
    }

    revalidatePath('/', 'layout');
    return { success: true, reply };
  } catch (e) {
    console.error('Error in createReply:', e);
    return { success: false, error: 'Failed to create reply' };
  }
}

export async function getRetweetsByUserId(userId: string) {
  try {
    const tweets = await prisma.tweet.findMany({
      where: {
        authorId: userId,
        OR: [{ retweetOfId: { not: null } }, { originalTweetDeleted: true }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: safeAuthorSelect,
        },
        likes: true,
        retweetOf: {
          include: {
            author: { select: safeAuthorSelect },
            likes: true,
            retweets: { select: { authorId: true } },
            _count: { select: { replies: true, retweets: true } },
          },
        },
        retweets: { select: { authorId: true } },
        _count: { select: { replies: true, retweets: true } },
      },
    });
    return { success: true, tweets };
  } catch (e) {
    console.error('Error in getRetweetsByUserId:', e);
    return { success: false, error: 'Failed to fetch retweets' };
  }
}
