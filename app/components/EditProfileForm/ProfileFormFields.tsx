'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ProfileFormFieldsProps {
  name: string;
  userName: string;
  bio: string;
  job: string;
  isSubmitting: boolean;
  isUploading: boolean;
  setName: (val: string) => void;
  setUserName: (val: string) => void;
  setBio: (val: string) => void;
  setJob: (val: string) => void;
}

export default function ProfileFormFields({
  name,
  userName,
  bio,
  job,
  isSubmitting,
  isUploading,
  setName,
  setUserName,
  setBio,
  setJob,
}: ProfileFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
          className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          Username <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="top-2.5 left-3.5 absolute text-white/40 text-sm">@</span>
          <input
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="username"
            className="w-full bg-black/50 pr-3.5 pl-8 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          Bio
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the world about yourself..."
          className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          Occupation / Job
        </label>
        <input
          type="text"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="Developer, Designer, Writer..."
          className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <Link
          href="/profile"
          className="hover:bg-white/10 px-5 py-2 border border-white/20 rounded-full font-bold text-sm transition-colors text-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 px-6 py-2 rounded-full font-bold text-black text-sm transition-colors cursor-pointer"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}
