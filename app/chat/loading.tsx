import Frame from '../components/Frame';
import { NavbarSkeleton } from '../components/Navbar';

export default function ChatLoading() {
  return (
    <>
      <NavbarSkeleton />
      <Frame>
        <main className="flex flex-col gap-3 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-surface shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="w-32 h-4 bg-surface rounded" />
                <div className="w-48 h-3 bg-surface rounded" />
              </div>
              <div className="w-10 h-3 bg-surface rounded" />
            </div>
          ))}
        </main>
      </Frame>
    </>
  );
}
