'use client';

import { logOut } from '@/app/lib/actions/auth';
import { LogOut } from 'lucide-react';

export default function SignOutBtn() {
  return (
    <button 
      onClick={() => logOut()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-white bg-surface hover:bg-surface-2 rounded-full border border-surface transition-all"
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </button>
  );
}
