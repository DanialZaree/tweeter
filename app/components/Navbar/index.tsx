import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="h-20 px-4 flex flex-row items-center mt-4  bg-surface-2 w-full rounded-2xl justify-between">
      <Link href={'/profile'}>
        <div className="h-12 w-12 rounded-full overflow-hidden  outline-2 outline-border outline-offset-2">
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
      <Link href={'/'}>Tweeter</Link>
    </nav>
  );
}
