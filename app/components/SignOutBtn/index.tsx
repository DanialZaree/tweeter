'use client';

import { logOut } from '@/app/lib/actions/auth';

export default function SignOutBtn() {
  return <button onClick={() => logOut()}>logOut</button>;
}
