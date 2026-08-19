'use client';

import { logOut } from '@/app/lib/actions/auth';
import { LogOut } from 'lucide-react';

export default function SignOutBtn() {
  return (
    <button
      onClick={() => logOut()}
      className="flex items-center gap-2 hover:bg-red-500/30 px-4 py-2 border border-red-500/50 rounded-full font-medium text-red-500 text-sm transition-all cursor-pointer"
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </button>
  );
}
