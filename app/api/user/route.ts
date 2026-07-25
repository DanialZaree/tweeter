'use server';
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {},
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await prisma.user.create({
      data: {
        name: body.name,
        job: body.job,
        userName: body.userName,
        email: body.email,
        password: body.password,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

