import Link from 'next/link';
import { auth } from '@/app/auth';
import prisma from '@/app/lib/prisma';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';
import { getGradientFromName } from '../../lib/avatar';
import { Bird } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default async function Navbar() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, avatar: true },
      })
    : null;

  const name = user?.name ?? session?.user?.name;
  const image = user?.avatar ?? session?.user?.image;

  const bgGradient = name ? getGradientFromName(name) : 'bg-slate-300';

  return (
    <nav className="top-4 z-50 sticky flex flex-row justify-between items-center gap-2 bg-surface/60 shadow-sm backdrop-blur-md mt-4 px-4 sm:px-6 border border-surface rounded-2xl w-full min-h-16 sm:min-h-20 transition-all duration-300">
      <Link href={'/'} className="group flex items-center gap-2 font-bold hover:text-blue-500 text-xl sm:text-2xl truncate tracking-tight transition-colors">
        <Bird className="text-blue-500 group-hover:scale-110 transition-transform" />
        Tweeter
      </Link>
      <div className="flex flex-row items-center gap-3 sm:gap-4 shrink-0">
        {session ? <SignOutBtn /> : <SignInBtn />}
        <Link href={session ? '/profile' : '/auth'} aria-label="User Profile" className="group shrink-0">
          <div className={`rounded-full outline-2 outline-border outline-offset-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-lg ${bgGradient}`}>
            <Avatar name={name} image={image} size={48} className="" />
          </div>
        </Link>
      </div>
    </nav>
  );
}
