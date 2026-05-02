import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { id } from 'zod/locales';

export async function GET() {
  try {
    const database = await db();
    const tweets = await database
      .collection('tweets')
      .aggregate([
        {
          $lookup: {
            from: 'users', // Your users collection name
            let: { tweetAuthorId: '$authorId' }, // Pass the authorId from the tweet
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $toString: '$_id' }, // Convert User's ObjectId _id to String
                      { $toString: '$$tweetAuthorId' }, // Convert Tweet's authorId (String) to String
                    ],
                  },
                },
              },
            ],
            as: 'authorData',
          },
        },
        {
          $unwind: {
            path: '$authorData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            authorId: 1,
            content: 1,
            createdAt: 1,

            authorName: '$authorData.name',
            authorUsername: '$authorData.userName',
            authorAvatar: '$authorData.avatar',
            authorJob: '$authorData.job',
          },
        },
      ])
      .toArray();
    return NextResponse.json(tweets);
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
