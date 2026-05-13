'use server';

import { signIn, signOut } from '@/app/auth';

export async function logIn() {
  await signIn('github', { redirectTo: '/' });
}

export async function logOut() {
  await signOut({ redirectTo: '/' });
}
