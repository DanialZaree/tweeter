'use server';

import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { id } from 'zod/locales';

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { includes } from 'zod';

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
    return NextResponse.json(tweets)
  } catch {
    return NextResponse.json({ error: 'faild to find any tweet' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const database = await db();

    if (!body.authorId || !body.content) {
      return NextResponse.json({ error: 'authorId and content are required' }, { status: 400 });
    }

    const result = await database.collection('tweets').insertOne({
      authorId: body.authorId,
      content: body.content,
      createdAt: new Date(),
    });
    return NextResponse.json(
      {
        _id: result.insertedId,
        authorId: body.authorId,
        content: body.content,
        createdAt: new Date(),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'error in posting data' }, { status: 500 });
  }
}
