'use server';

import bcrypt from 'bcrypt';
import prisma from '../prisma';

interface RegisterData {
  userName: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
    const { userName, email, password } = data;

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
