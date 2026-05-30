'use server';

import bcrypt from 'bcrypt';
import prisma from '../prisma';

export async function register(formdata: FormData) {
  const userName = formdata.get('userName') as string;
  const email = formdata.get('email') as string;
  const password = formdata.get('password') as string;

  if (!email || !password || !userName) {
    throw new Error("missing fields")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email, userName: userName },
  });
  if (existingUser) {
    throw new Error('email or username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      userName: userName,
      name: userName,
    },
  });
}
