'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../prisma';
import { signIn } from '@/app/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { sendOtpEmail } from '../resend';
import { headers } from 'next/headers';

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

export async function registerUser(
  data: RegisterData,
  otpCode: string,
): Promise<AuthActionResult | undefined> {
  const email = data.email?.trim().toLowerCase();
  const userName = data.userName?.trim().toLowerCase();
  const password = data.password;
  const otp = otpCode?.trim();

  if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
    return { success: false, error: 'Verification code must be 4 digits' };
  }

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

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: validation.data.email, token: otp },
  });
  if (!record) {
    return { success: false, error: 'Invalid verification code' };
  }
  if (new Date() > record.expires) {
    await prisma.verificationToken.deleteMany({ where: { identifier: validation.data.email } });
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: validation.data.email } });

  const RESERVED_USERNAMES = new Set([
    'profile',
    'admin',
    'administrator',
    'api',
    'auth',
    'login',
    'signup',
    'signin',
    'chats',
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
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid credentials' };
    }
    throw error;
  }
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
    await signIn('credentials', { userName: normalizedUserName, password, redirectTo: '/' });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid userName or password' };
    }
    throw error;
  }
}

export async function handleSendOtp(userEmail: string) {
  try {
    const validEmail = userEmail?.trim().toLowerCase();

    const validation = z.string().email().safeParse(validEmail);
    if (!validation.success) {
      return { success: false, error: 'Invalid email address' };
    }

    const rateCheck = await checkRateLimit(`otp:${validEmail}`, 3, 60);
    if (!rateCheck.success) {
      return {
        success: false,
        error: rateCheck.error || 'Too many requests. Please try again later.',
      };
    }

    const forwardedFor = (await headers()).get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    
    const ipRateCheck = await checkRateLimit(`otp_ip:${ip}`, 5, 60);
    if (!ipRateCheck.success) {
      return {
        success: false,
        error: 'Too many requests from this IP. Please try again later.',
      };
    }

    const otp = crypto.randomInt(0, 10000).toString().padStart(4, '0');

    const result = await sendOtpEmail(validEmail, otp);
    if (!result.success) {
      return { success: false, error: 'Failed to send verification code' };
    }

    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationToken.deleteMany({
      where: { identifier: validEmail },
    });
    await prisma.verificationToken.create({
      data: {
        identifier: validEmail,
        token: otp,
        expires,
      },
    });

    return { success: true, message: `Verification code has been sent to ${validEmail}` };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Error in sending OTP' };
  }
}

export async function verifyOtp(email: string, otp: string) {
  try {
    const validEmail = email?.trim().toLowerCase();
    const code = otp?.trim();

    const emailValidation = z.string().email().safeParse(validEmail);
    if (!emailValidation.success) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      return { success: false, error: 'Verification code must be 4 digits' };
    }

    const rateCheck = await checkRateLimit(`verify_otp:${validEmail}`, 5, 300);
    if (!rateCheck.success) {
      return {
        success: false,
        error:
          rateCheck.error || 'Too many failed attempts. Please wait 5 minutes before trying again.',
      };
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: validEmail, token: code },
    });

    if (!record) {
      return { success: false, error: 'Invalid verification code' };
    }

    if (new Date() > record.expires) {
      await prisma.verificationToken.deleteMany({ where: { identifier: validEmail } });
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    await prisma.verificationToken.deleteMany({ where: { identifier: validEmail } });

    return { success: true, message: 'Email verified successfully!' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify code. Please try again.' };
  }
}

export async function sendRegistrationOtp(data: RegisterData): Promise<AuthActionResult> {
  const email = data.email?.trim().toLowerCase();
  const userName = data.userName?.trim().toLowerCase();
  const password = data.password;

  const validation = registerSchema.safeParse({ userName, email, password });
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };

  const rateCheck = await checkRateLimit(`register:${email}`, 3, 60);
  if (!rateCheck.success) {
    return {
      success: false,
      error: rateCheck.error || 'Too many requests. Please try again later.',
    };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { success: false, error: 'email already exists' };

  const existingUser = await prisma.user.findUnique({ where: { userName } });
  if (existingUser) return { success: false, error: 'username already exists' };

  return handleSendOtp(email);
}
