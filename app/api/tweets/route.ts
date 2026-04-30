import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { id } from 'zod/locales';

export async function GET() {
  try {
    const database = await db();
    const tweets = await database.collection('tweets').find({}).toArray();
    console.log(tweets)
    return NextResponse.json(tweets);
  } catch {
    return NextResponse.json({ error: 'faild to find any tweet' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const database = await db();

    const result = await database.collection('tweets').insertOne({
      _id: body.id,
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
