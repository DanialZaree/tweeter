import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function GET() {
  try {
    const database = await db();
    const users = await database.collection('users').find({}).toArray();

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const database = await db();

    const result = await database.collection("users").insertOne({
      name:body.name,
      createdAt:new Date(),
    })

    return NextResponse.json({id:result.insertedId,name:body.name},{status:201})
  } catch (e) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
export async function DELETE(requset:Request) {
  
}
//https://www.youtube.com/watch?v=cc_xmawJ8Kg&t=39s&pp=ygUTcmVhY3QgZm9ybSBob29rIHpvZNIHCQnfCgGHKiGM7w%3D%3D
//https://www.youtube.com/watch?v=7t_cL2BQ5Ok&pp=ygUPbW9uZ28gZGIgbmV4dGpz
//https://www.youtube.com/watch?v=bIHZLHabZB4&pp=ygUPbW9uZ28gZGIgbmV4dGpz0gcJCd8KAYcqIYzv