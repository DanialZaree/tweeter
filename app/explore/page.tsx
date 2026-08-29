import type { Metadata } from 'next';
import { auth } from '../auth';
import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import ExploreTabs from '../components/ExploreTabs';
import NewTweet from '../components/ui/NewTweet';
import { allTweets, followingTweets } from '../lib/actions/tweet';
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

  const allTweetsData = await allTweets();

  let followingTweetsData = null;
  if (currentUserId) {
    followingTweetsData = await followingTweets(currentUserId);
  }

  return (
    <>
      <Navbar />
      <Frame>
        <main>
          <Suspense
            fallback={
              <div className="mx-auto w-full max-w-xl mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TweetSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ExploreTabs
              allTweetsData={allTweetsData}
              followingTweetsData={followingTweetsData}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isLoggedIn={!!currentUserId}
            />
          </Suspense>
        </main>
        {session?.user && <NewTweet />}
      </Frame>
    </>
  );
}
