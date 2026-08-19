'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SignOutBtn from '../SignOutBtn';

interface EditProfileHeaderProps {
  isSubmitting: boolean;
  isUploading: boolean;
}

export default function EditProfileHeader({ isSubmitting, isUploading }: EditProfileHeaderProps) {
  return (
    <div className="top-0 z-10 sticky flex items-center justify-between bg-black/80 backdrop-blur-md px-4 py-3 border-white/10 border-b">
      <div className="flex items-center gap-4">
        <Link href="/profile" className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg sm:text-xl">Edit profile</h1>
      </div>
      
      <SignOutBtn />
    </div>
  );
}
