import { auth } from './auth';
import Navbar from './components/Navbar';
import Frame from './components/Frame';
import TweetList from './components/TweetList';
import Test from './components/Test';
import NewTweet from './components/ui/NewTweet';
import { allTweets } from './lib/actions/tweet';
import { Suspense } from 'react';

export default async function Home() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const { success, tweets, error } = await allTweets();
  return (
    <>
      <Frame>
        <Navbar />
        <Suspense fallback={<div>Loading tweets...</div>}>
          <TweetList success={success} tweets={tweets ?? []} error={error} currentUserId={currentUserId} />
        </Suspense>
        <NewTweet />
      </Frame>
    </>
  );
}
