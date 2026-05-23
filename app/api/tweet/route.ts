'use server';

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const tweets = await prisma.tweet.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ error: 'failed to find any tweet' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.authorId || !body.content) {
      return NextResponse.json(
        { error: 'you must login and content is required' },
        { status: 400 },
      );
    }

    const latestTweet = await prisma.tweet.findFirst({
      orderBy: {
        tweetId: 'desc',
      },
    });

    const newTweetId = latestTweet ? (parseInt(latestTweet.tweetId, 10) + 1).toString() : '1';

    const tweet = await prisma.tweet.create({
      data: {
        authorId: body.authorId,
        tweetId: newTweetId,
        content: body.content,
        createdAt: new Date(),
      },
    });

    revalidatePath('/');
    return NextResponse.json(
      {
        id: tweet.id,
        authorId: tweet.authorId,
        content: tweet.content,
        createdAt: tweet.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Error in posting data' }, { status: 500 });
  }
}
