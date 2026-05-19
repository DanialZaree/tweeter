import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

interface Params {
  username: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { username } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        userName: username,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
