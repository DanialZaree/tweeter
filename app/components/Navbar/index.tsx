import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="top-0 z-10 sticky flex items-center justify-between bg-black/80 backdrop-blur-md py-3 px-4 sm:px-6 mb-4 border-white/10 border-b w-full">
      <Link
        href={'/'}
        className="group flex items-center gap-2.5 font-bold hover:text-blue-500 text-xl sm:text-2xl truncate tracking-tight transition-colors"
      >
        <Image
          src="/icons/logo.svg"
          alt="Boblo Logo"
          width={28}
          height={28}
          className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
          priority
        />
        Boblo
      </Link>
      <button className="hover:bg-white/10 p-2 rounded-full transition-colors text-white">
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
}
