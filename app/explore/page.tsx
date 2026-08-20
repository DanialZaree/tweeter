import { auth } from '../auth';
import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import TweetList from '../components/TweetList';
import NewTweet from '../components/ui/NewTweet';
import { allTweets } from '../lib/actions/tweet';
import { Suspense } from 'react';

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
              <div className="p-4 text-center text-muted-foreground">Loading tweets...</div>
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
