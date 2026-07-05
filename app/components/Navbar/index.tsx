'use server';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/app/auth';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';
import avatar from '../ui/Avatar';
import {getGradientFromName} from '../../lib/avatar';
import Avatar from '../ui/Avatar';

export default async function Navbar() {
  const session = await auth();
  console.log('Session in Navbar:', session?.user.image);
  const bgGradient = session?.user?.name ? getGradientFromName(session.user.name) : 'bg-slate-300';

  return (
    <nav className="flex flex-row justify-between items-center bg-surface-2 mt-4 px-4 rounded-2xl w-full h-20">
      <Link href={'/profile'}>
        <div className={`rounded-full outline-2 outline-border outline-offset-2 w-12 h-12 overflow-hidden ${bgGradient}`}>
            <Avatar name={session?.user.name} image={session?.user.image} size={48} className="" />
        </div>
      </Link>
      {session ? <SignOutBtn /> : <SignInBtn />}
      <Link href={'/'}>Tweeter</Link>
    </nav>
  );
}
