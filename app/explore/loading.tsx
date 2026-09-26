import Frame from '../components/Frame';
import { NavbarSkeleton } from '../components/Navbar';
import TweetSkeleton from '../components/Tweet/TweetSkeleton';

export default function ExploreLoading() {
  return (
    <>
      <NavbarSkeleton />
      <Frame>
        <main className="mx-auto w-full max-w-xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <TweetSkeleton key={i} />
          ))}
        </main>
      </Frame>
    </>
  );
}

