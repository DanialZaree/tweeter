'use server';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/app/auth';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';

export default async function Navbar() {
  const session = await auth();
  console.log(session?.user?.image);
  return (
    <nav className="flex flex-row justify-between items-center bg-surface-2 mt-4 px-4 rounded-2xl w-full h-20">
      <Link href={'/profile'}>
        <div className="rounded-full outline-2 outline-border outline-offset-2 w-12 h-12 overflow-hidden">
          {session?.user?.image && (
            <Image
              alt="user-profile"
              src={`${session?.user?.image}`}
              width={48}
              height={48}
              loading="lazy"
              fetchPriority="auto"
            />
          )}
        </div>
      </Link>
      {session ? <SignOutBtn /> : <SignInBtn />}
      <Link href={'/'}>Tweeter</Link>
    </nav>
  );
}
