'use server';

import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { signIn } from '@/app/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

import { z } from 'zod';
import { checkRateLimit } from '@/app/lib/ratelimit';

const registerSchema = z.object({
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .toLowerCase(),
  email: z
    .string()
    .email('Invalid email address')
    .max(50, 'Email must be less than 50 characters')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(64, 'Password must be under 64 characters'),
});

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

  const validation = registerSchema.safeParse({ userName, email, password });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message };
  }

  const rateCheck = await checkRateLimit(`register:${email}`, 5, 900);
  if (!rateCheck.success) {
    return {
      success: false,
      error: rateCheck.error || 'Too many registration attempts. Please try again later.',
    };
  }

  const RESERVED_USERNAMES = new Set([
    'profile',
    'admin',
    'administrator',
    'api',
    'auth',
    'login',
    'signup',
    'register',
    'settings',
    'user',
    'users',
    'home',
    'explore',
    'notifications',
    'messages',
    'bookmarks',
    'help',
    'support',
    'terms',
    'privacy',
    'about',
    'dashboard',
    'status',
    'system',
  ]);
  if (RESERVED_USERNAMES.has(validation.data.userName)) {
    return { success: false, error: 'This username is reserved' };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: validation.data.email },
  });
  if (existingEmail) {
    return { success: false, error: 'email already exists' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { userName: validation.data.userName },
  });
  if (existingUser) {
    return { success: false, error: 'username already exists' };
  }

  const hashedPassword = await bcrypt.hash(validation.data.password, 10);

  await prisma.user.create({
    data: {
      email: validation.data.email,
      password: hashedPassword,
      userName: validation.data.userName,
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

export async function login(
  userName: string,
  password: string,
): Promise<AuthActionResult | undefined> {
  const normalizedUserName = userName?.trim().toLowerCase();

  const rateCheck = await checkRateLimit(`login:${normalizedUserName}`, 5, 900);
  if (!rateCheck.success) {
    return {
      success: false,
      error: rateCheck.error || 'Too many login attempts. Please try again later.',
    };
  }
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
