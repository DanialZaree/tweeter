import { notFound } from 'next/navigation';
import { getTweetById } from '@/app/lib/actions/tweet';
import Tweet from '@/app/components/Tweet';
import Frame from '@/app/components/Frame';
import Navbar from '@/app/components/Navbar';
import NewTweetForm from '@/app/components/NewTweetForm';
import { auth } from '@/app/auth';

export default async function TweetPage({ params }: { params: Promise<{ tweet: string }> }) {
  const resolvedParams = await params;
  const tweetid = resolvedParams.tweet;

  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const { tweet, success, error } = await getTweetById(tweetid);

    if (!success) {
      return (
        <Frame>
          <Navbar />
          <div className="mt-8 text-red-500 text-center">{error}</div>
        </Frame>
      );
    }

    if (!tweet) notFound();

    return (
      <Frame>
        <Navbar />
        <div className="mt-4">
          <Tweet data={tweet} currentUserId={currentUserId} />
          {currentUserId && (
            <div className="mt-4 p-4 border border-surface rounded-xl">
              <p className="mb-3 text-text-muted text-sm">Reply to this tweet</p>
              <NewTweetForm parentId={tweet.id} />
            </div>
          )}
          {tweet.replies && tweet.replies.length > 0 && (
            <div className="flex flex-col mt-4">
              <p className="mb-2 px-1 text-text-muted text-sm">
                {tweet.replies.length} {tweet.replies.length === 1 ? 'Reply' : 'Replies'}
              </p>
              {tweet.replies.map((reply) => (
                <Tweet key={reply.id} data={reply} currentUserId={currentUserId} />
              ))}
            </div>
          )}
          {tweet.replies?.length === 0 && (
            <p className="mt-8 text-text-muted text-sm text-center">
              No replies yet. Be the first!
            </p>
          )}
        </div>
      </Frame>
    );
  } catch (e) {
    return (
      <Frame>
        <Navbar />
        <div className="mt-8 text-red-500 text-center">Failed to fetch tweet</div>
      </Frame>
    );
  }
}
