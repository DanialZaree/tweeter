import { auth } from '@/app/auth';
import Link from 'next/link';
import { PushNotificationManager } from '@/app/components/PushNotificationManager';
import { Bell } from 'lucide-react';

export default async function HomeAuthActions() {
  const session = await auth();

  return (
    <>
      <div className="flex flex-row gap-4 mt-2">
        {!session ? (
          <>
            <Link
              href="/auth"
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 text-sm font-semibold text-white bg-surface rounded-full hover:bg-surface-2 transition-colors border border-white/10"
            >
              Explore Posts
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/explore"
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Explore Posts
            </Link>
            <Link
              href={`/${session.user.userName || 'profile'}`}
              className="px-6 py-3 text-sm font-semibold text-white bg-surface rounded-full hover:bg-surface-2 transition-colors border border-white/10"
            >
              My Profile
            </Link>
          </>
        )}
      </div>
      {session && (
        <div className="mt-4 flex justify-center w-full">
          <PushNotificationManager />
        </div>
      )}
    </>
  );
}

export function HomeAuthActionsSkeleton() {
  return (
    <>
      <div className="flex flex-row gap-4 mt-2">
        <div className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md animate-pulse">
          Explore Posts
        </div>
        <div className="px-6 py-3 text-sm font-semibold text-white bg-surface rounded-full hover:bg-surface-2 transition-colors border border-white/10 animate-pulse">
          My Profile
        </div>
      </div>
      <div className="mt-4 flex justify-center w-full">
        <div className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-fit animate-pulse">
          <Bell size={16} />
          <span>Enable Push Notifications</span>
        </div>
      </div>
    </>
  );
}


