"use server"
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/app/auth';
import SignInBtn from '../SignInBtn';

export default async function Navbar() {
  const session = await auth()
  return (
    <nav className="flex flex-row justify-between items-center bg-surface-2 mt-4 px-4 rounded-2xl w-full h-20">
      <Link href={'/profile'}>
        <div className="rounded-full outline-2 outline-border outline-offset-2 w-12 h-12 overflow-hidden">
          <Image
            alt="user-profile"
            src={'/uploads/default.png'}
            width={48}
            height={48}
            loading="lazy"
            fetchPriority="auto"
          />
        </div>
      </Link>
        <SignInBtn/> 
      <Link href={'/'}>Tweeter</Link>
    </nav>
  );
}
