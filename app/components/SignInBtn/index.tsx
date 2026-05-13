'use client';

import { logIn } from '@/app/lib/actions/auth';

export default function SignInBtn() {
  return <button onClick={() => logIn()}>login</button>;
}
