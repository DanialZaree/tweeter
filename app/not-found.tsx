import Link from 'next/link';
import Frame from '@/app/components/Frame';
import Navbar from '@/app/components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <Frame>
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
          <h1 className="text-7xl font-extrabold text-sky-400 mb-2 tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold mb-3 text-foreground">Page Not Found</h2>
          <p className="text-text-muted mb-6 max-w-md text-base leading-relaxed">
            Hmm... the page you are looking for doesn't exist, was removed, or is temporarily
            unavailable.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-full transition-all shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </Frame>
    </>
  );
}
