'use server';

import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { signIn } from '@/app/auth';

interface RegisterData {
  userName: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const { userName, email, password } = data;

  if (!email || !password || !userName) {
    throw new Error('missing fields');
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingEmail) {
    throw new Error('email already exists');
  }

  const existingUser = await prisma.user.findUnique({
    where: { userName: userName },
  });
  if (existingUser) {
    throw new Error('username already exists');
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

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/',
  });
}
