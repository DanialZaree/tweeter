'use client';

import { logIn } from '@/app/lib/actions/auth';

export default function SignInBtn() {
  return (
    <button 
      onClick={() => logIn()}
      className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
    >
      Sign In
    </button>
  );
}
