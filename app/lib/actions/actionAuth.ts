'use server';

import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { signIn } from '@/app/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

interface RegisterData {
  userName: string;
  email: string;
  password: string;
}

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export async function registerUser(data: RegisterData): Promise<AuthActionResult | undefined> {
  const email = data.email?.trim().toLowerCase();
  const userName = data.userName?.trim().toLowerCase();
  const password = data.password;

  if (!email || !password || !userName) {
    return { success: false, error: 'missing fields' };
  }

  const USERNAME_REGEX = /^[a-z0-9]{3,20}$/;
  if (!USERNAME_REGEX.test(userName)) {
    return { success: false, error: 'Username can only contain letters and numbers (3 to 20 characters)' };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    return { success: false, error: 'email already exists' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { userName },
  });
  if (existingUser) {
    return { success: false, error: 'username already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      userName,
      name: data.userName.trim(),
    },
  });

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid credentials' };
    }
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return { success: false, error: 'Failed to sign in after registration' };
  }

  redirect('/');
}

export async function login(userName: string, password: string): Promise<AuthActionResult | undefined> {
  const normalizedUserName = userName?.trim().toLowerCase();
  try {
    await signIn('credentials', { userName: normalizedUserName, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid userName or password' };
    }
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return { success: false, error: 'Invalid userName or password' };
  }

  redirect('/');
}

