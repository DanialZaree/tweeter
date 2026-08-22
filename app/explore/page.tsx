import type { Metadata } from 'next';
import { auth } from '../auth';
import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import TweetList from '../components/TweetList';
import NewTweet from '../components/ui/NewTweet';
import { allTweets } from '../lib/actions/tweet';
import { Suspense } from 'react';
import TweetSkeleton from '../components/Tweet/TweetSkeleton';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Explore trending posts, popular discussions, and recent thoughts on Boblo.',
  alternates: {
    canonical: '/explore',
  },
  openGraph: {
    title: 'Explore | Boblo',
    description: 'Explore trending posts, popular discussions, and recent thoughts on Boblo.',
    url: '/explore',
  },
};

export default async function Explore() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.userName;

  const { success, tweets, error } = await allTweets();
  return (
    <>
      <Navbar />
      <Frame>
        <main>
          <Suspense
            fallback={
              <div className="mx-auto w-full max-w-xl">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TweetSkeleton key={i} />
                ))}
              </div>
            }
          >
            <TweetList
              success={success}
              tweets={tweets ?? []}
              error={error}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </Suspense>
        </main>
        {session?.user && <NewTweet />}
      </Frame>
    </>
  );
}
