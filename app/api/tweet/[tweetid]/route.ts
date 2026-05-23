import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ tweetid: string }> }) {
  const { tweetid } = await params;

  try {
    const tweet = await prisma.tweet.findUnique({
      where: {
        tweetId: tweetid,
      },
      include: {
        author: true,
      },
    });

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    return NextResponse.json(tweet);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
