'use server';
import Link from 'next/link';
import { auth } from '@/app/auth';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';
import { getGradientFromName } from '../../lib/avatar';
import { Bird } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default async function Navbar() {
  const session = await auth();
  console.log('Session in Navbar:', session?.user.image);
  const bgGradient = session?.user?.name ? getGradientFromName(session.user.name) : 'bg-slate-300';

  return (
    <nav className="flex flex-row justify-between items-center bg-surface/60 backdrop-blur-md border border-surface mt-4 px-4 sm:px-6 rounded-2xl w-full min-h-[4rem] sm:min-h-[5rem] gap-2 sticky top-4 z-50 transition-all duration-300 shadow-sm">
      <Link href={'/'} className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight truncate group hover:text-blue-500 transition-colors">
        <Bird className="text-blue-500 group-hover:scale-110 transition-transform" />
        Tweeter
      </Link>
      <div className="flex flex-row items-center gap-3 sm:gap-4 shrink-0">
        {session ? <SignOutBtn /> : <SignInBtn />}
        <Link href={'/profile'} className="shrink-0 group">
          <div className={`rounded-full outline-2 outline-border outline-offset-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-lg ${bgGradient}`}>
            <Avatar name={session?.user.name} image={session?.user.image} size={48} className="" />
          </div>
        </Link>
      </div>
    </nav>
  );
}
